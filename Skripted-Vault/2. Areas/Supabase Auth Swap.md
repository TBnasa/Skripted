---
title: "Supabase Auth Swap Mechanism"
created: 2026-05-08
status: active
priority: high
complexity: medium
related_services: [Clerk, Supabase, API Routes]
type: area
tags: [auth, backend, security, clerk, supabase]
---

# Supabase Auth Swap Mechanism

File: `src/lib/supabase-auth-swap.ts`

Because Skripted uses **Clerk** for frontend user authentication but **Supabase** for the database (and RLS), we need a way to tell Supabase *who* is making requests from the server-side.

## Architecture Diagram
```mermaid
sequenceDiagram
    participant Frontend
    participant Clerk
    participant APIRoute as API Route
    participant Jose as Auth Swap (jose)
    participant Supabase as Supabase DB

    Frontend->>Clerk: Login
    Clerk-->>Frontend: Clerk Session
    Frontend->>APIRoute: Fetch Data (Clerk Auth)
    APIRoute->>Jose: Pass clerkUserId
    Jose-->>APIRoute: Generate custom JWT signed with SUPABASE_JWT_SECRET
    APIRoute->>Supabase: Query DB using custom JWT
    Supabase-->>APIRoute: Return RLS-filtered Data
```

## How It Works
Instead of using Supabase's native auth module directly, we generate a custom JWT signed with the `SUPABASE_JWT_SECRET`.

1. We take the `clerkUserId`.
2. We craft a payload setting the role to `authenticated` and the `sub` (subject) to the `clerkUserId`.
3. We set an expiration (`exp`) of 24 hours.
4. We sign it using the `jose` library (which works well in Edge runtimes like Next.js middleware).

## Usage
This custom token is then injected into the Supabase client creation process (likely in `supabase-server.ts`), allowing Supabase to apply its Row Level Security policies (see [[Database Implementation Details]]) based on the Clerk user ID.
