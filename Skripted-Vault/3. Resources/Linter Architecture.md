---
title: "Skript Linter Architecture"
created: 2026-05-08
type: resource
tags: [skript, parser, monaco, ide]
---

# Skript Linter Architecture

The Skripted IDE features a custom, lightweight, real-time linter built for the Monaco Editor.
File: `src/lib/skript-linter.ts`

## Core Mechanics
The linter parses the document line-by-line (`model.getLinesContent()`) and generates `monaco.editor.setModelMarkers`.

### Validation Rules (Currently Implemented):
1. **Indentation Consistency**: Warns if a single file mixes tabs and spaces (Skript is highly sensitive to this).
2. **Missing Colon**: Checks block keywords (`on`, `if`, `else`, `while`, `loop`, `command`, `function`) to ensure the line ends with `:`. Marks as `ERROR`.
3. **Unexpected Colon**: Checks common effect keywords (`send`, `teleport`, `give`) to warn if they end with a colon improperly. Marks as `WARNING`.
4. **Variable Brace Matching**: Counts `{` and `}` on a line to ensure variables are closed.
5. **Indentation Depth**: Checks if a line following a colon-terminated block is indented further than the previous line.

## Integration
- Attaches via `setupSkriptLinter`.
- **Debounced**: Validation runs 500ms after the user stops typing to prevent UI lag.
