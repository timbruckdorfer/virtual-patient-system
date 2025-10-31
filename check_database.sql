-- SQL queries to check TUM user IDs in the database

-- 1. Check sessions table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

-- 2. Get all sessions with user IDs
SELECT 
  id as session_id,
  case_id,
  user_id,
  started_at,
  ended_at
FROM sessions
ORDER BY started_at DESC
LIMIT 20;

-- 3. Count sessions per user
SELECT 
  user_id,
  COUNT(*) as session_count,
  MIN(started_at) as first_session,
  MAX(started_at) as last_session
FROM sessions
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY session_count DESC;

-- 4. Get unique user IDs
SELECT DISTINCT user_id
FROM sessions
WHERE user_id IS NOT NULL
ORDER BY user_id;

-- 5. Get sessions with message counts
SELECT 
  s.user_id,
  s.id as session_id,
  s.case_id,
  s.started_at,
  COUNT(m.id) as message_count
FROM sessions s
LEFT JOIN messages m ON s.id = m.session_id
WHERE s.user_id IS NOT NULL
GROUP BY s.user_id, s.id, s.case_id, s.started_at
ORDER BY s.started_at DESC
LIMIT 20;

