---
title: "Project Brief: Skripted Platform"
created: 2026-05-08
type: project
tags: [core, nextjs, skript]
---

# Skripted Platform Brief

## Overview
Skripted is a modular platform designed for developers to create, share, and learn about "Skripts" (likely a domain-specific language for automation or gameplay). It features a real-time IDE, an AI-powered academy, and a community gallery.

## Core Pillars
1. **Academy**: AI-powered mentorship and interactive lessons for learning the Skript language.
2. **IDE/Chat**: A integrated environment where users can write code assisted by a Chatbot.
3. **Gallery**: A marketplace or community hub for sharing and downloading user-created scripts.
4. **Judge/Execution**: A backend service to validate or execute scripts.

## Key Technical Decisions
- **Framework**: Next.js 16 (App Router)
- **Backend**: Supabase (Auth, DB, Storage) + Pinecone (Vector Search)
- **AI**: OpenRouter integration for LLM capabilities.
- **Styling**: Tailwind CSS 4.

## Active Goals (Q2 2026)
- Complete database optimization (Indexing as per `SQL_MIGRATIONS.md`).
- Enhance the AI Academy's mentor interaction.
- Refine the Skript linter and execution engine.
