---
title: "Chat Interface Architecture"
created: 2026-05-08
type: area
tags: [frontend, chat, components, ui]
---

# Chat Interface Architecture

File: `src/features/chat/components/ChatInterface.tsx`

This is the primary workspace where users interact with the Skripted Engine. It orchestrates the sidebar, chat panel, and Monaco editor.

## State Connections
It heavily relies on the `useStore` (see [[Frontend State Management]]) for:
- `messages`, `editorCode`, `sessionId`, `isStreaming`, `isAnalyzing`.

## Core Features
1. **Re-hydration Sync**: On mount, if a `sessionId` exists, it hits `/api/chats/[id]` to reload the history and sets the editor code to the last AI output via `extractCode()`.
2. **Manual Save**: Implements a `Ctrl+S` / `Cmd+S` listener to manually trigger a save to `/api/session`.
3. **Feedback System**: Captures user feedback (thumbs up/down) and sends it alongside the `generatedCode` to `/api/feedback`.
4. **React Query Integration**: Uses `@tanstack/react-query` to fetch usage limits (`/api/session/usage`). When a new message is completed, it invalidates this cache to reflect the new usage count immediately.

## Layout Structure
- **Sidebar**: Chat history management.
- **Top Bar**: Dashboard Overview (compact) and Engine Status indicator.
- **Split View**:
  - `ChatPanel`: The conversation thread.
  - `EditorPanel`: The Monaco code editor containing the generated or user-provided code.
