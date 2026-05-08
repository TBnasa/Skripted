---
title: "Skript Language Specification"
created: 2026-05-08
type: resource
tags: [skript, language, documentation]
---

# Skript Language Specification

Reference material for the core "Skript" language used across the platform.

## Key Files
- `src/lib/skript-language.ts`: Contains the grammar and token definitions.
- `src/lib/skript-linter.ts`: Logic for real-time error detection.

## Language Features (Summary)
*To be populated as the language evolves.*

- **Modular Design**: Scripts can likely import or reference other scripts.
- **Linter Support**: Real-time feedback in the IDE.
- **Execution Engine**: Integrated with `judge-service.ts`.

## Integration Tips
- Use the `EditorPanel.tsx` component to provide a rich coding experience.
- Leverage `ChatInterface.tsx` for AI-assisted coding.
