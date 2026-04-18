/* ═══════════════════════════════════════════
   Skripted — Google AI (Gemma/Gemini) Client
   ═══════════════════════════════════════════ */

import { GoogleGenerativeAI, Content, Part } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_AI_API_KEY || "";
const MODEL_NAME = process.env.GOOGLE_AI_MODEL || "gemma-2-27b";

const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Converts standard chat messages to Google AI format
 */
function convertMessagesToGoogleFormat(messages: readonly Message[]): { contents: Content[], systemInstruction?: string } {
  const contents: Content[] = [];
  let systemInstruction = "";

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemInstruction = msg.content;
      continue;
    }

    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content } as Part]
    });
  }

  return { contents, systemInstruction };
}

/**
 * Streams a chat completion from Google AI
 */
export async function streamGoogleCompletion(
  messages: readonly Message[],
): Promise<ReadableStream<Uint8Array>> {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    systemInstruction: convertMessagesToGoogleFormat(messages).systemInstruction 
  });

  const { contents } = convertMessagesToGoogleFormat(messages);

  let result;
  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      result = await model.generateContentStream({
        contents,
        generationConfig: {
          temperature: 0.3,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });
      break; // Success!
    } catch (error: any) {
      if (error.status === 503 || error.message?.includes('503')) {
        retries--;
        console.warn(`[Google AI] 503 error, retries remaining: ${retries}`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }

  if (!result) throw new Error("Failed to initialize Google AI stream after retries.");


  // Convert Google AI async iterator to ReadableStream
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            // Encode as an SSE-like chunk for the frontend to consume
            // Or just raw bytes if the frontend handles it
            const data = new TextEncoder().encode(text);
            controller.enqueue(data);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
