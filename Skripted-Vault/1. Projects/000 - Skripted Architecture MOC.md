---
title: "Master Map: Skripted Architecture"
created: 2026-05-08
type: moc
tags: [index, moc, architecture]
---

# 🗺️ Master Map: Skripted Architecture (Command Center)

This is the central Map of Content (MOC) for the Skripted project. It serves as the "Command Center," branching into specialized domain maps.

## 🧭 Domain Maps (Sub-MOCs)

*   **[[001 - Backend & Database MOC]]**: Security, API routes, SQL migrations, and Auth Swap.
*   **[[002 - AI & LLM Engine MOC]]**: System prompts, RAG context, and OpenRouter integration.
*   **[[003 - Frontend Architecture MOC]]**: State management, IDE components, theming, and linter.
*   **[[004 - Academy Curriculum MOC]]**: Gamification, curriculum data, and learning logic.

## 🛡️ Core "Kernel" Resources
These notes cover cross-cutting concerns that affect all domains.

*   **[[Global Constants & Environment]]**: Centralized config and .env mapping.
*   **[[Standardized Error Handling]]**: Unified backend-to-frontend error pattern.
*   **[[API Handler Pattern]]**: The `withAuth` wrapper architecture.
*   **[[Zod Schema Validation]]**: The global source of truth for data integrity.

---
*Tip: This MOC follows a "Command Center" pattern. Start with the Domain Maps for deep dives into specific subsystems.*
