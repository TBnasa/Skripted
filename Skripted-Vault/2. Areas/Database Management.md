---
title: "Supabase & Database Strategy"
created: 2026-05-08
type: area
tags: [supabase, database, architecture]
---

# Supabase & Database Strategy

This area focuses on the long-term maintenance and optimization of the Skripted database layer.

## Table Schema (Assumed)
- `gallery_posts`: Community scripts and metadata.
- `post_comments`: User feedback on scripts.
- `post_likes`: Social signals for ranking.
- `user_scripts`: Private user script storage.
- `user_script_versions`: Version control for user scripts.

## Optimization Patterns
- **Indexing**: Always index columns used in `WHERE`, `ORDER BY`, and `JOIN` clauses.
- **RLS (Row Level Security)**: Mandatory for all tables to protect user data.
- **RPC (Remote Procedure Calls)**: Use for atomic operations like `increment_download_count`.

## Maintenance Tasks
- Regular VACUUM ANALYZE to keep indices fresh.
- Monitoring query performance via Supabase dashboard.
