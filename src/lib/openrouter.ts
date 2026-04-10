/* ═══════════════════════════════════════════
   Skripted — OpenRouter Client
   ═══════════════════════════════════════════ */

import { OPENROUTER_BASE_URL, OPENROUTER_MODEL } from './constants';

const FALLBACK_API_KEY = process.env.OPENROUTER_API_KEY ?? '';

// User requested these to be primary keys. If they fail, we use the fallback.
const PRIMARY_KEYS = [
  process.env.OPENROUTER_PRIMARY_KEY_1 ?? '',
  process.env.OPENROUTER_PRIMARY_KEY_2 ?? ''
].filter(Boolean);

// Fallback logic uses all valid keys, trying primary first
const ALL_KEYS = [...PRIMARY_KEYS, FALLBACK_API_KEY].filter(Boolean);

interface OpenRouterMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

/**
 * Helper function to fetch with key rotation on rate-limit/payment-required
 */
export async function fetchWithKeyRotation(
  url: string,
  options: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> }
): Promise<Response> {
  let lastError = null;

  for (let i = 0; i < ALL_KEYS.length; i++) {
    const key = ALL_KEYS[i];
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://skripted.dev',
      'X-Title': 'Skripted',
    };

    try {
      const response = await fetch(url, { ...options, headers });

      // If we get rate limited (429) out of credits (402), or forbidden (403), try the next key
      if (response.status === 429 || response.status === 402 || response.status === 403) {
        console.warn(`[OpenRouter] Key index ${i} failed with status ${response.status}. Trying next key...`);
        lastError = response;
        continue;
      }

      // If successful or other error types, return the response immediately
      return response;
    } catch (error) {
      console.warn(`[OpenRouter] Fetch failed with key index ${i}:`, error);
      lastError = error;
      // Network errors -> try next key
      continue;
    }
  }

  // If all keys fail, return the last response or throw
  if (lastError instanceof Response) {
    return lastError;
  }
  throw lastError || new Error('All OpenRouter API keys failed.');
}

/**
 * Streams a chat completion from OpenRouter (Qwen3.6-plus:free).
 * Returns a ReadableStream of raw SSE chunks.
 */
export async function streamChatCompletion(
  messages: readonly OpenRouterMessage[],
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetchWithKeyRotation(OPENROUTER_BASE_URL, {
    method: 'POST',
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      stream: true,
      temperature: 0.3,
      max_tokens: 32768,
      top_p: 0.9,
      include_reasoning: true,
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
  const response = await fetchWithKeyRotation(OPENROUTER_BASE_URL, {
    method: 'POST',
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
