---
title: "AI System Prompt Architecture"
created: 2026-05-08
status: active
priority: critical
complexity: high
related_services: [OpenRouter, Pinecone Vector Search (RAG)]
type: resource
tags: [ai, prompts, llm, system]
---

# AI System Prompt Architecture

File: `src/lib/system-prompt.ts`
The core AI persona is "Skripted Engine (The Architect)". It is highly structured to provide consistent API-like responses for the UI to parse.

## Core Features

### 1. Protection Layer (Tiering)
The prompt dynamically changes based on the user's tier (`userTier`).
- **Free Tier**: Enforces the "Triple-Threat Signature":
  - Comment block header.
  - `sked_` prefix branding on internal functions.
  - Zero-Width Steganography (invisible characters) inside strings to track uncredited use.
- **Pro Tier**: Bypasses all protection; delivers clean, white-label code.

### 2. Mandatory Response Structure
When code is requested, the LLM MUST return a specific format containing JSON blocks that the frontend parses to render UI components (like the Analysis Panel).
- `[Code Solution]`: The raw code. (Often augmented by [[Pinecone Vector Search (RAG)]] context)
- `[Educational Tip]`: 1 sentence.
- `[FINAL_ANALYSIS]`: JSON containing score, syntax errors, logic flaws, and performance issues.
- `[VISUAL_FLOW]`: JSON representing a mind-map/node structure of the code's logic.

### 3. Language Mirroring
Strict protocol to detect if the user speaks Turkish or English and lock all headers, tips, and JSON values to that language.

### 4. Technical Constraints
- Prefers modern NBT.
- Enforces 4 spaces or 1 tab after colons.
- Distinguishes between Global (`{prefix::key::value}`) and Local (`{_var}`) variables.
