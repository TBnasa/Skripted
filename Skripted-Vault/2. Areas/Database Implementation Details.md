---
title: "Database Migrations & History"
created: 2026-05-08
type: area
tags: [backend, database, sql, supabase]
---

# Database Migrations & History

This document tracks specific database implementations, primarily focused on Supabase.

## Granular Chat History Implementation
File: `migrations/chat_history.sql`

To maintain session context across page reloads and track AI usage, a granular `chat_history` table was implemented.

### Table Schema (`public.chat_history`)
- `id`: UUID (Primary Key)
- `user_id`: TEXT (Nullable, links to Auth)
- `session_id`: UUID (Groups messages together into a single IDE session)
- `role`: TEXT (Strict constraint: 'user' or 'assistant')
- `content`: TEXT (The actual message/code)
- `created_at`: TIMESTAMPTZ

### Performance Indices
- `idx_chat_history_session`: Crucial for loading a specific IDE session quickly.
- `idx_chat_history_user`: Used for fetching the user's dashboard history.

### Security (RLS)
- RLS is ENABLED.
- Current Policy: `"Users can access their own history"` is currently set to `USING (true)` for convenience during development, but rely on the Service Role key for secure backend operations. **Action Item: Tighten this policy before production.**
