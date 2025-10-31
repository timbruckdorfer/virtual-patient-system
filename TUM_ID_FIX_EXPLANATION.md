# TUM ID Extraction Fix

## Problem
- TUM ID wasn't being extracted because original OIDC claims were lost after storing in session cookie
- Session cookie only stored `sub`, `email`, `name` - not enough to extract TUM ID later
- User ID in database showing "anon" instead of real TUM IDs

## Solution Implemented

### 1. Extract TUM ID at Authentication Time
When TUM OIDC returns all claims (in `/auth/callback`), we now:
- Extract TUM ID from email (e.g., `ge38qap@mytum.de` → `ge38qap`)
- Try other claim fields as fallback (`preferred_username`, `login`, `tumid`, etc.)
- Store the extracted TUM ID in the session cookie

### 2. Use Stored TUM ID Later
- `/auth/me` endpoint now returns the stored `tum_id`
- Session creation uses the stored `tum_id` for database `user_id`

## How to Fix "anon" User IDs (Issue #3)

The "anon" user ID means `REQUIRE_AUTH=false`. To fix:

### In Production (Cloud Run):
1. Go to Cloud Run console: https://console.cloud.google.com/run
2. Select your service: `virtual-patient-system-eu`
3. Click "Edit & Deploy New Revision"
4. Go to "Variables & Secrets" tab
5. Add/Update environment variable:
   - Name: `REQUIRE_AUTH`
   - Value: `true`
6. Deploy

### Verify:
After deployment, check your database:
```sql
SELECT DISTINCT user_id FROM sessions WHERE user_id != 'anon';
```

You should now see TUM IDs like `ge38qap` instead of `anon`.

## Testing Steps

1. **Deploy this code** to production
2. **Clear all cookies** and log out
3. **Log in again** with TUM credentials
4. **Check user menu** - should show `TUM ID: ge38qap` (your actual ID)
5. **Create a new session** - check database, `user_id` should be your TUM ID

## If TUM ID Still Not Working

If after deployment you still see the wrong ID:

1. Check browser Network tab → `/auth/me` response
2. If `tum_id` is still wrong, check what email format TUM provides
3. The code extracts from `email` field if it contains `@mytum.de`
4. If TUM uses different email domain, we need to update `_extract_tum_id_from_claims()`

## Code Changes Summary

- ✅ `_extract_tum_id_from_claims()` - New function to extract TUM ID from OIDC claims
- ✅ `_set_session()` - Now extracts and stores TUM ID in session cookie
- ✅ `/auth/me` - Returns stored `tum_id` from session
- ✅ Session creation - Uses stored `tum_id` for database `user_id`

