from fastapi import FastAPI, Depends, HTTPException, Query, Request, File, UploadFile
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import uuid
import time
import httpx
import json
import os

from .config import settings
from .db import get_db
from sqlalchemy.orm import Session as OrmSession
from sqlalchemy import func, desc
from .models import Case, Session as ChatSession, Message

from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from jose.utils import base64url_decode

# Updated: Trigger redeployment to pick up new OIDC configuration
app = FastAPI(title="Virtual Patient Backend", version="0.1.0")

# Add CORS middleware
# In production, the frontend is served from the same origin
# In development, allow localhost:3000
cors_origins = ["http://localhost:3000"]
if settings.environment == "production":
    # Allow same-origin requests in production
    cors_origins = ["*"]  # Or specify your Cloud Run URL

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for VHB sessions (not persisted to database)
# Structure: {session_id: {"case_id": str, "messages": [{"role": str, "content": str}]}}
vhb_sessions: Dict[str, Dict] = {}


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/health/db")
async def health_db(db: OrmSession = Depends(get_db)) -> dict:
    """Check database connectivity."""
    try:
        # Simple query to test DB connection
        result = db.execute(func.now())
        timestamp = result.scalar()
        return {"status": "ok", "database": "connected", "timestamp": str(timestamp)}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "error": str(e)}


# ---------------------
# OIDC Authentication
# ---------------------

class OIDCState(BaseModel):
    state: str
    nonce: str
    issued_at: int
    redirect_to: Optional[str] = None


def _sign(data: dict) -> str:
    return jwt.encode(
        claims=data,
        key=settings.app_secret_key,
        algorithm="HS256",
        headers={"typ": "JWT"},
    )


def _verify(token: str) -> dict:
    try:
        return jwt.decode(token, settings.app_secret_key, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid session")


def _set_cookie(response, name: str, value: str, max_age: int = 3600) -> None:
    # In production (HTTPS), cookies must have secure=True
    # In development (HTTP), secure=False is needed
    is_production = settings.environment == "production"
    
    response.set_cookie(
        key=name,
        value=value,
        max_age=max_age,
        httponly=True,
        secure=is_production,  # True in production (HTTPS), False in dev (HTTP)
        samesite="lax",
        path="/",
    )


@app.get("/auth/login")
async def auth_login(request: Request, redirect_to: Optional[str] = None) -> RedirectResponse:
    if not all([
        settings.oidc_auth_url,
        settings.oidc_client_id,
        settings.oidc_redirect_uri,
    ]):
        raise HTTPException(status_code=500, detail="OIDC not configured")

    state = uuid.uuid4().hex
    nonce = uuid.uuid4().hex
    state_token = _sign({
        "state": state,
        "nonce": nonce,
        "issued_at": int(time.time()),
        "redirect_to": redirect_to or "/",
    })

    params = {
        "response_type": "code",
        "client_id": settings.oidc_client_id,
        "redirect_uri": settings.oidc_redirect_uri,
        "scope": "openid",
        "state": state,
        "nonce": nonce,
    }
    # Build authorize URL
    from urllib.parse import urlencode

    authorize_url = f"{settings.oidc_auth_url}?{urlencode(params)}"
    response = RedirectResponse(authorize_url, status_code=302)
    _set_cookie(response, "oidc_state", state_token, max_age=600)
    return response


async def _fetch_jwks() -> dict:
    if not settings.oidc_jwks_url:
        raise HTTPException(status_code=500, detail="OIDC_JWKS_URL not configured")
    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(settings.oidc_jwks_url)
        res.raise_for_status()
        return res.json()


def _set_session(response: RedirectResponse, claims: dict) -> None:
    session_claims = {
        "sub": claims.get("sub"),
        "email": claims.get("email"),
        "name": claims.get("name"),
        "iat": int(time.time()),
        "exp": int(time.time()) + 60 * 60 * 24,  # 24h
    }
    token = _sign(session_claims)
    _set_cookie(response, "session", token, max_age=60 * 60 * 24)


def get_current_user(request: Request) -> Optional[dict]:
    token = request.cookies.get("session")
    if not token:
        return None
    try:
        return _verify(token)
    except HTTPException:
        return None


def require_user(request: Request) -> dict:
    if not settings.require_auth:
        # auth disabled; provide anonymous user
        return {"sub": "anon", "name": "Anonymous"}
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@app.get("/auth/callback")
async def auth_callback(request: Request, code: Optional[str] = None, state: Optional[str] = None) -> RedirectResponse:
    if code is None or state is None:
        raise HTTPException(status_code=400, detail="Missing code/state")
    state_token = request.cookies.get("oidc_state")
    if not state_token:
        raise HTTPException(status_code=400, detail="Missing state cookie")
    st = _verify(state_token)
    if st.get("state") != state:
        raise HTTPException(status_code=400, detail="State mismatch")

    # Exchange code for tokens
    if not all([settings.oidc_token_url, settings.oidc_client_id, settings.oidc_client_secret, settings.oidc_redirect_uri]):
        raise HTTPException(status_code=500, detail="OIDC not configured")

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.oidc_redirect_uri,
        "client_id": settings.oidc_client_id,
        "client_secret": settings.oidc_client_secret,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        token_res = await client.post(settings.oidc_token_url, data=data)
        token_res.raise_for_status()
        token_payload = token_res.json()

    id_token = token_payload.get("id_token")
    if not id_token:
        raise HTTPException(status_code=400, detail="Missing id_token")
    
    access_token = token_payload.get("access_token")

    # Verify id_token using JWKS
    jwks = await _fetch_jwks()
    try:
        claims = jwt.decode(
            id_token, 
            jwks, 
            algorithms=["RS256"], 
            audience=settings.oidc_client_id, 
            issuer=settings.oidc_issuer,
            access_token=access_token
        )
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid id_token: {str(e)}")

    # Basic nonce check
    if claims.get("nonce") != st.get("nonce"):
        raise HTTPException(status_code=401, detail="Invalid nonce")

    # Redirect back to frontend after successful authentication
    frontend_path = st.get("redirect_to") or "/"
    redirect_to = f"{settings.frontend_url}{frontend_path}"
    response = RedirectResponse(redirect_to, status_code=302)
    _set_session(response, claims)
    # remove the temporary state cookie
    response.delete_cookie("oidc_state", path="/")
    return response


@app.get("/auth/me")
async def auth_me(request: Request) -> JSONResponse:
    """Get current user information."""
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return JSONResponse(content={
        "sub": user.get("sub"),
        "email": user.get("email"),
        "name": user.get("name"),
    })


@app.post("/auth/logout")
async def auth_logout() -> JSONResponse:
    response = JSONResponse(content={"ok": True})
    response.delete_cookie("session", path="/")
    return response


class VHBLoginRequest(BaseModel):
    password: str


@app.post("/auth/vhb-login")
async def vhb_login(req: VHBLoginRequest) -> JSONResponse:
    """Authenticate VHB users with a shared password."""
    if not settings.vhb_password:
        raise HTTPException(status_code=503, detail="VHB login not configured")
    
    if req.password != settings.vhb_password:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Create session token for VHB user
    session_claims = {
        "sub": "vhb-guest",
        "email": "vhb@external.de",
        "name": "VHB User",
        "is_vhb_user": True,  # Flag to identify VHB users
        "iat": int(time.time()),
        "exp": int(time.time()) + 60 * 60 * 24,  # 24h
    }
    token = _sign(session_claims)
    
    response = JSONResponse(content={"ok": True, "token": token})
    _set_cookie(response, "session", token, max_age=60 * 60 * 24)
    return response


class CreateSessionRequest(BaseModel):
    case_id: str


class CreateSessionResponse(BaseModel):
    session_id: str
    case_id: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str
    session_id: str


def _load_case_data(case_id: str) -> Dict:
    """Load case data from JSON file."""
    case_file = os.path.join(os.path.dirname(__file__), "cases", f"{case_id}.json")
    if not os.path.exists(case_file):
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found")
    
    with open(case_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def _ensure_case(db: OrmSession, case_id: str) -> Case:
    case = db.get(Case, case_id)
    if case is None:
        # Load case data to get title
        try:
            case_data = _load_case_data(case_id)
            title = case_data.get("title", case_id)
            language = case_data.get("language", "de")
        except HTTPException:
            # Fallback for unknown cases
            title = case_id
            language = "de"
        
        case = Case(id=case_id, title=title, language=language)
        db.add(case)
        db.commit()
    return case


def _load_case_prompt(case_id: str) -> str:
    """Load case prompt from JSON file."""
    try:
        case_data = _load_case_data(case_id)
        return case_data["persona"]["prompt"]
    except (HTTPException, KeyError):
        return "Du bist ein Simulationspatient. Antworte kurz auf Deutsch."


def _get_openai_client():
    from openai import OpenAI

    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    return OpenAI(api_key=settings.openai_api_key)


@app.post("/api/sessions", response_model=CreateSessionResponse)
async def create_session(
    req: CreateSessionRequest,
    request: Request,
    db: OrmSession = Depends(get_db)
) -> CreateSessionResponse:
    user = require_user(request)
    session_id = str(uuid.uuid4())
    
    # Check if this is a VHB user
    is_vhb = user.get("is_vhb_user", False)
    
    if is_vhb:
        # Store session in memory only, don't persist to database
        vhb_sessions[session_id] = {
            "case_id": req.case_id,
            "messages": [{"role": "system", "content": f"Case: {req.case_id}"}]
        }
    else:
        # Normal TUM user: persist to database
        _ensure_case(db, req.case_id)
        chat_session = ChatSession(
            id=session_id,
            case_id=req.case_id,
            user_id=user.get("sub")
        )
        db.add(chat_session)
        db.add(Message(session_id=session_id, role="system", content=f"Case: {req.case_id}"))
        db.commit()
    
    return CreateSessionResponse(session_id=session_id, case_id=req.case_id)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, db: OrmSession = Depends(get_db)) -> ChatResponse:
    # Check if this is a VHB session (in-memory)
    if req.session_id in vhb_sessions:
        vhb_session = vhb_sessions[req.session_id]
        case_id = vhb_session["case_id"]
        persona = _load_case_prompt(case_id)
        
        # Build messages from in-memory storage
        messages_to_send = [{"role": "system", "content": persona}]
        for m in vhb_session["messages"]:
            if m["role"] in ("user", "assistant"):
                messages_to_send.append({"role": m["role"], "content": m["content"]})
        messages_to_send.append({"role": "user", "content": req.message})
        
        # Call OpenAI
        client = _get_openai_client()
        completion = client.chat.completions.create(
            model=settings.openai_model,
            messages=messages_to_send,  # type: ignore[arg-type]
            temperature=0.6,
            max_tokens=300,
        )
        
        reply = completion.choices[0].message.content or ""
        
        # Store messages in memory only (no DB persistence)
        vhb_session["messages"].append({"role": "user", "content": req.message})
        vhb_session["messages"].append({"role": "assistant", "content": reply})
        
        return ChatResponse(reply=reply, session_id=req.session_id)
    
    # Normal TUM user session: handle from database
    chat_session = db.get(ChatSession, req.session_id)
    if chat_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    # Fetch messages ordered
    msgs = db.query(Message).filter(Message.session_id == req.session_id).order_by(Message.id.asc()).all()

    case_id = chat_session.case_id
    persona = _load_case_prompt(case_id)

    messages_to_send = [{"role": "system", "content": persona}]
    for m in msgs:
        if m.role in ("user", "assistant"):
            messages_to_send.append({"role": m.role, "content": m.content})
    messages_to_send.append({"role": "user", "content": req.message})

    client = _get_openai_client()
    completion = client.chat.completions.create(
        model=settings.openai_model,
        messages=messages_to_send,  # type: ignore[arg-type]
        temperature=0.6,
        max_tokens=300,
    )

    reply = completion.choices[0].message.content or ""
    
    # Extract token usage
    usage = completion.usage
    tokens_in = usage.prompt_tokens if usage else None
    tokens_out = usage.completion_tokens if usage else None

    # Persist turn with token usage
    db.add(Message(session_id=req.session_id, role="user", content=req.message, tokens_in=tokens_in))
    db.add(Message(session_id=req.session_id, role="assistant", content=reply, tokens_out=tokens_out))
    db.commit()

    return ChatResponse(reply=reply, session_id=req.session_id)


@app.post("/api/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
) -> JSONResponse:
    """Transcribe audio to text using OpenAI Whisper."""
    try:
        # Read audio file
        audio_data = await audio.read()
        
        # Get OpenAI client
        client = _get_openai_client()
        
        # Transcribe using Whisper
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=("audio.webm", audio_data, "audio/webm"),
            language="de"  # German language hint for better accuracy
        )
        
        return JSONResponse(content={"text": transcript.text})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


# Analytics and Export endpoints

class SessionSummary(BaseModel):
    session_id: str
    case_id: str
    started_at: datetime
    ended_at: Optional[datetime]
    message_count: int
    total_tokens_in: Optional[int]
    total_tokens_out: Optional[int]


class ExportResponse(BaseModel):
    sessions: List[SessionSummary]
    total_sessions: int
    date_range: str


@app.get("/api/export", response_model=ExportResponse)
async def export_sessions(
    case_id: Optional[str] = Query(None, description="Filter by case ID"),
    days: int = Query(7, description="Number of days to look back"),
    db: OrmSession = Depends(get_db)
) -> ExportResponse:
    """Export session data for analytics and evaluation."""
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Build query
    query = db.query(ChatSession)
    if case_id:
        query = query.filter(ChatSession.case_id == case_id)
    query = query.filter(ChatSession.started_at >= start_date)
    
    sessions = query.order_by(desc(ChatSession.started_at)).all()
    
    # Build summaries with token counts
    session_summaries = []
    for session in sessions:
        # Get token totals for this session
        token_stats = db.query(
            func.sum(Message.tokens_in).label('total_in'),
            func.sum(Message.tokens_out).label('total_out'),
            func.count(Message.id).label('msg_count')
        ).filter(Message.session_id == session.id).first()
        
        session_summaries.append(SessionSummary(
            session_id=session.id,
            case_id=session.case_id,
            started_at=session.started_at,
            ended_at=session.ended_at,
            message_count=token_stats.msg_count or 0,
            total_tokens_in=token_stats.total_in,
            total_tokens_out=token_stats.total_out
        ))
    
    return ExportResponse(
        sessions=session_summaries,
        total_sessions=len(session_summaries),
        date_range=f"{start_date.date()} to {end_date.date()}"
    )


@app.get("/api/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    db: OrmSession = Depends(get_db)
) -> JSONResponse:
    """Get all messages for a specific session."""
    
    session = db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.id.asc()).all()
    
    return JSONResponse(content={
        "session_id": session_id,
        "case_id": session.case_id,
        "started_at": session.started_at.isoformat(),
        "ended_at": session.ended_at.isoformat() if session.ended_at else None,
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "tokens_in": msg.tokens_in,
                "tokens_out": msg.tokens_out
            }
            for msg in messages
        ]
    })


@app.get("/api/cases/{case_id}")
async def get_case_details(case_id: str) -> JSONResponse:
    """Get case details including patient persona information."""
    try:
        case_data = _load_case_data(case_id)
        persona = case_data.get("persona", {})
        
        return JSONResponse(content={
            "id": case_data.get("id", case_id),
            "title": case_data.get("title", ""),
            "language": case_data.get("language", "de"),
            "patient_name": persona.get("name", ""),
            "patient_age": persona.get("age", ""),
            "patient_occupation": persona.get("occupation", "")
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load case: {str(e)}")


@app.get("/api/analytics/summary")
async def get_analytics_summary(
    days: int = Query(7, description="Number of days to look back"),
    db: OrmSession = Depends(get_db)
) -> JSONResponse:
    """Get basic analytics summary."""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Session counts by case
    case_stats = db.query(
        ChatSession.case_id,
        func.count(ChatSession.id).label('session_count')
    ).filter(
        ChatSession.started_at >= start_date
    ).group_by(ChatSession.case_id).all()
    
    # Total token usage
    token_stats = db.query(
        func.sum(Message.tokens_in).label('total_tokens_in'),
        func.sum(Message.tokens_out).label('total_tokens_out'),
        func.count(Message.id).label('total_messages')
    ).join(ChatSession).filter(
        ChatSession.started_at >= start_date
    ).first()
    
    return JSONResponse(content={
        "date_range": f"{start_date.date()} to {end_date.date()}",
        "sessions_by_case": [
            {"case_id": case_id, "session_count": count}
            for case_id, count in case_stats
        ],
        "total_tokens_in": token_stats.total_tokens_in or 0,
        "total_tokens_out": token_stats.total_tokens_out or 0,
        "total_messages": token_stats.total_messages or 0,
        "total_sessions": sum(count for _, count in case_stats)
    })


# Mount static files and serve frontend (production only)
if settings.environment == "production":
    frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
    
    if os.path.exists(frontend_dist):
        # Serve static assets (JS, CSS, images)
        app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
        
        # Serve other static files (favicon, images, etc.)
        static_files = ["favicon.ico", "file.svg", "globe.svg", "next.svg", "vercel.svg", "window.svg"]
        for file in static_files:
            file_path = os.path.join(frontend_dist, file)
            if os.path.exists(file_path):
                @app.get(f"/{file}")
                async def serve_static_file(file_name=file):
                    return FileResponse(os.path.join(frontend_dist, file_name))
        
        # Serve patient images
        patients_dir = os.path.join(frontend_dist, "patients")
        if os.path.exists(patients_dir):
            app.mount("/patients", StaticFiles(directory=patients_dir), name="patients")
        
        # Serve index.html for all other routes (SPA support)
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            # Don't interfere with API routes
            if full_path.startswith("api/") or full_path.startswith("auth/") or full_path == "health":
                raise HTTPException(status_code=404, detail="Not found")
            
            return FileResponse(os.path.join(frontend_dist, "index.html"))


