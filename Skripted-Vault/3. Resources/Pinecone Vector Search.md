---
title: "Pinecone Vector Search (RAG)"
created: 2026-05-08
status: active
priority: medium
complexity: medium
related_services: [System Prompt Design, API Routes Map]
type: resource
tags: [ai, rag, pinecone, search]
---

# Pinecone Vector Search (RAG)

File: `src/lib/pinecone.ts`

This module connects Skripted to a Pinecone vector database to provide context for the AI (Retrieval-Augmented Generation).

## Core Mechanisms

### 1. Integrated Inference
- Skripted uses Pinecone's **integrated inference**. This means we don't need a separate API call to OpenAI or Cohere to create embeddings first. We pass the raw text query directly to Pinecone (`inputs: { text: query }`), and Pinecone handles the embedding automatically based on the index's configuration.
- Target Namespace: `examples`.

### 2. Search Results (`searchSkriptExamples`)
- Returns up to `PINECONE_TOP_K` results.
- Retrieves metadata: `text`, `title`, `version`, `quality`, `addon_required`.

### 3. Context Formatting (`formatRAGContext`)
- Formats the retrieved hits into a Markdown string to be injected into the [[System Prompt Design]].
- **Safety Limit:** Caps the total context string at `MAX_CONTEXT_CHARS` (8000 chars, ~2000 tokens) to prevent the LLM from throwing token overflow errors or "forgetting" the main instructions.
