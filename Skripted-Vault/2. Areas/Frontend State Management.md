---
title: "State Management Architecture (Zustand)"
created: 2026-05-08
type: area
tags: [frontend, architecture, zustand, state]
---

# State Management Architecture

The Skripted application relies heavily on `zustand` for state management, specifically utilizing the `persist` middleware to survive page reloads.

## 1. App Store (`useStore.ts`)
Manages the core IDE and global application state.

### State Slices:
- **Chat State**:
  - `messages`: Array of `ChatMessage` objects.
  - `editorCode`: Current code in the Monaco editor.
  - `sessionId`: Unique identifier for the current session.
  - `isStreaming` / `isAnalyzing`: UI blocking flags.
- **Dashboard/Usage**:
  - `stats`: Aggregated metrics (`totalAnalyzed`, `averageScore`).
  - `usage`: Rate limiting data (`current`, `limit`).
  - `history`: Last 50 `AnalysisHistoryItem` records.

### Persistence Strategy:
- **LocalStorage**: `stats` and `history` (survives tab closure).
- **SessionStorage**: `editorCode`, `messages`, `sessionId` (survives refresh, wiped on tab close).

## 2. Academy Store (`useAcademyStore.ts`)
Manages the gamified learning experience, driving the logic defined in [[Academy Content Structure]].

### State Slices:
- **Progress**: `xp`, `completedLessons` (array of IDs), `currentLessonId`, `currentModuleId`.
- **Learning Logic**: `mistakes` (tracking expected vs actual), `flaggedConcepts`, `hintsUsed`.
- **Virtual Simulator**: `virtualVariables`, `lastErrorCode`, `currentCode` (for executing code in the browser).

### Core Methods:
- `isModuleUnlocked`: Checks gate conditions (e.g., must finish 'basics-boss' to unlock 'variables').
- `getPhase`: Derives visual phase ('blocks' | 'bridge' | 'code') from current XP level.
- **Persistence**: Entirely in LocalStorage.
