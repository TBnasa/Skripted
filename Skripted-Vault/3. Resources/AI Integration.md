---
title: "OpenRouter & AI Integration"
created: 2026-05-08
type: resource
tags: [ai, openrouter, llm]
---

# OpenRouter & AI Integration

Guidelines for AI interactions within the Skripted platform.

## Configuration
- Client: `src/lib/openrouter.ts`
- Prompting: `src/lib/system-prompt.ts` and `src/lib/academy-mentor-prompt.ts`.

## Best Practices
1. **Context Management**: Always provide the relevant code snippet or academy lesson to the AI.
2. **Streaming**: Use streaming responses for a better user experience in Chat.
3. **Safety**: Sanitize user inputs before sending to the LLM.

## Usage in App
- **Chat**: Code assistance and general queries.
- **Academy**: Interactive mentorship and lesson generation.
