---
name: obsidian-vault-manager
description: Expert assistant for managing an Obsidian vault using the PARA method. Use this when organizing notes, brainstorming (Thinking Partner mode), or performing research within the 'Skripted-Vault'.
---

# Obsidian Vault Manager

## Overview

This skill enables Gemini CLI to act as a sophisticated "second brain" companion. It leverages the PARA method to keep information organized and actionable.

## Core Workflows

### 1. Thinking Partner Mode
When the user wants to brainstorm, follow these steps:
1.  **Search Existing Context**: Use `grep_search` in `Skripted-Vault` to see if the topic has been mentioned before.
2.  **Ask Clarifying Questions**: Don't just give answers; engage in a dialogue to refine the idea.
3.  **Draft to Inbox**: Save brainstorm sessions to `0. Inbox` if they are new, or update existing project notes.

### 2. PARA Maintenance
-   **Inbox Processing**: Help the user move notes from `0. Inbox` to the appropriate PARA folder.
-   **Project Initialization**: Create a standard "Project Brief" for any new project in `1. Projects`.
-   **Vault Health**: Run `scripts/vault-stats.cjs` to get an overview of the vault's current state.

### 3. Note Creation & Formatting
-   **YAML Frontmatter**: Always include title, date, type, and tags.
-   **Atomic Style**: Keep notes focused. Use internal links `[[Note Name]]` to connect ideas.
-   **Sanitization**: Ensure no sensitive data is saved in notes.

## Tools

- `scripts/vault-stats.cjs`: Summarize file counts in PARA folders.

## Examples

- "Start a new project for the Next.js migration."
- "What do I have in my Resources about Supabase?"
- "Help me brainstorm a new feature for Skripted."
- "Show me a health report for my vault."
