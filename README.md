## Virtual Patient System

Complete LLM-based virtual patient system for medical student training with FastAPI backend and Next.js frontend.

### Setup

1. Create and activate venv
```
python3 -m venv mri_env
source mri_env/bin/activate
```

2. Install dependencies
```
pip install -r requirements.txt
```

3. Environment
Copy the `env-template` file to `.env` and update with your credentials:
```bash
cp env-template .env
```

Then edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your-actual-openai-key
```

The TUM OIDC configuration is already set up with the production values. If you need to generate a new `APP_SECRET_KEY`, run:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Optional: VHB Login Configuration**
To enable VHB (external) login, add the following to your `.env` file:
```
VHB_PASSWORD=virtualpatients-vhb
```
This password allows VHB users to log in without TUM credentials. VHB sessions are not tracked in the database.

4. Postgres (local)
- Install Postgres (macOS/Homebrew): `brew install postgresql@16`
- Start service: `brew services start postgresql@16`
- Create DB: `createdb vpatient` (ensure `/opt/homebrew/opt/postgresql@16/bin` is in PATH)

5. Database migrations
- Initialize (already done in repo via Alembic): `alembic init alembic`
- Create migration from models: `alembic revision -m "init schema" --autogenerate`
- Apply migrations: `alembic upgrade head`

6. Run dev server
```
uvicorn app.main:app --reload
```

### API Endpoints

**Core Chat:**
- POST `/api/sessions`: `{ "case_id": "bauchschmerzen" }` → `{ "session_id", "case_id" }`
- POST `/api/chat`: `{ "session_id", "message" }` → `{ "reply", "session_id" }`

**Analytics & Export:**
- GET `/api/export`: Export session data (with `?case_id=bauchschmerzen&days=7`)
- GET `/api/sessions/{session_id}/messages`: Get full transcript for a session
- GET `/api/analytics/summary`: Basic usage statistics (with `?days=7`)

**Health:**
- GET `/health`: Service health check

### Authentication (OIDC / TUM)

The system now uses TUM's OpenID Connect (OIDC) for authentication. All users must log in with their TUM credentials before accessing the virtual patient system.

**Endpoints:**
- `GET /auth/login` → Redirects to TUM IdP for authentication
- `GET /auth/callback` → Handles OIDC callback, validates ID token, sets httpOnly session cookie
- `POST /auth/vhb-login` → VHB login with password (for external users)
- `GET /auth/me` → Returns current user information (sub, email, name)
- `POST /auth/logout` → Clears session cookie and logs out

**Authentication Flow (TUM Users):**
1. User visits the application and is redirected to `/login`
2. User clicks "Mit TUM-Kennung anmelden" button
3. User is redirected to TUM's login page (login.tum.de)
4. After successful authentication, user is redirected back to the application
5. Backend validates the ID token and creates a session
6. User can now access the case selection and chat pages

**VHB Login (External Users):**
The system supports VHB (Virtuelle Hochschule Bayern) users who can log in with a shared password.
1. User clicks "VHB Login" button on the login page
2. User enters the VHB password (configured via `VHB_PASSWORD` environment variable)
3. Upon successful authentication, user can access all features
4. VHB sessions are **not persisted** to the database (in-memory only)
5. VHB user activities are not tracked in analytics (for research purposes)

**Session Management:**
- Sessions are stored as httpOnly cookies for security
- TUM user identity (sub/email) is tied to chat sessions in the database
- VHB users use a shared guest account and sessions are stored in-memory only
- Session expires after 24 hours
- All API requests require authentication when `REQUIRE_AUTH=true`

**User Information:**
- User's name and email are displayed in the header
- Avatar with user initials in the top-right corner
- Logout option available via user menu

### Frontend

The frontend is a modern React application built with Vite and Material UI.

**Start frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Features:**
- Interactive chat interface with German patient simulation
- Case selection (multiple patient scenarios)
- Real-time message exchange
- Token usage tracking
- Material UI components and icons
- Responsive design for desktop and mobile
- Session management

**Tech Stack:**
- React 18 with TypeScript
- Vite 6 for fast development
- Material UI (MUI) components
- Material Icons
- Emotion for styling

See `frontend/README.md` for detailed frontend documentation and Material UI usage examples.

### Complete System

**Architecture:**
- **Backend**: FastAPI + PostgreSQL + OpenAI API
- **Frontend**: React + Vite + Material UI + TypeScript
- **Database**: Persistent session and message storage
- **Analytics**: Token tracking, usage statistics, export capabilities

**Usage Flow:**
1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser to `http://localhost:3000` (**important: use localhost, not 127.0.0.1**)
4. Log in with TUM credentials
5. Select case (Bauchschmerzen, etc.)
6. Conduct anamnesis conversation
7. View analytics and export data
8. Log out via user menu in header

### Notes

- Cases are persisted in Postgres; cases are auto-seeded on first use
- Ensure `.env` contains a valid `OPENAI_API_KEY` before using `/api/chat`
- Both servers (backend and frontend) must be running for full functionality
- Authentication is required - users must log in with TUM credentials
- Chat sessions are tied to user identity for tracking and analytics
- The database schema includes a `user_id` column in the sessions table

### Security Considerations

- Never commit the `.env` file to version control (it contains secrets)
- The `APP_SECRET_KEY` should be unique and kept secure
- Sessions use httpOnly cookies to prevent XSS attacks
- CORS is configured to only allow requests from the frontend domain
- ID tokens are validated using TUM's JWKS endpoint
- All authenticated endpoints check for valid session cookies

### Important: Use localhost (not 127.0.0.1)

For proper cookie functionality across the frontend (port 3000) and backend (port 8000), you **must** use `localhost` consistently:
- ✅ Access frontend at: `http://localhost:3000`
- ✅ Backend runs at: `http://localhost:8000`
- ❌ Do NOT use: `http://127.0.0.1:3000` or `http://127.0.0.1:8000`

Browsers are more lenient with cross-port cookies on `localhost` compared to explicit IP addresses, which is necessary for the OAuth callback flow to work correctly.


