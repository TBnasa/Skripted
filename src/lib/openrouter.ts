/* ═══════════════════════════════════════════
   Skripted — OpenRouter Client
   ═══════════════════════════════════════════ */

import { OPENROUTER_BASE_URL, OPENROUTER_MODEL } from './constants';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? '';

interface OpenRouterMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

/**
 * Streams a chat completion from OpenRouter (Qwen3.6-plus:free).
 * Returns a ReadableStream of raw SSE chunks.
 */
export async function streamChatCompletion(
  messages: readonly OpenRouterMessage[],
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(OPENROUTER_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://skripted.dev',
      'X-Title': 'Skripted',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      stream: true,
      temperature: 0.3,
      max_tokens: 4096,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
  }

  if (!response.body) {
    throw new Error('OpenRouter returned no response body');
  }

  return response.body;
}

/**
 * Non-streaming completion for feedback analysis or short tasks.
 */
export async function chatCompletion(
  messages: readonly OpenRouterMessage[],
): Promise<string> {
  const response = await fetch(OPENROUTER_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://skripted.dev',
      'X-Title': 'Skripted',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}
