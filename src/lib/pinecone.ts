/* ═══════════════════════════════════════════
   Skripted — Pinecone Client & Search
   Uses integrated inference (index auto-embeds)
   ═══════════════════════════════════════════ */

import { Pinecone } from '@pinecone-database/pinecone';
import { PINECONE_INDEX, PINECONE_TOP_K } from './constants';
import type { SkriptExample } from '@/types';

let pcClient: Pinecone | null = null;

function getPineconeClient() {
  if (!pcClient) {
    pcClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? '',
    });
  }
  return pcClient;
}

/**
 * Search the Skripted knowledge base for relevant Skript examples.
 * Uses Pinecone integrated inference — no separate embedding call needed.
 */
export async function searchSkriptExamples(
  query: string,
  topK: number = PINECONE_TOP_K,
): Promise<SkriptExample[]> {
  const start = performance.now();

  try {
    const pc = getPineconeClient();
    const index = pc.index(PINECONE_INDEX).namespace('examples');

    const results = await index.searchRecords({
      query: {
        topK,
        inputs: { text: query },
      },
      fields: ['text', 'title', 'version', 'quality', 'addon_required', 'chunk_index'],
    });

    const queryTime = performance.now() - start;

    if (!results.result?.hits) {
      return [];
    }

    return results.result.hits.map((hit) => {
      const fields = (hit.fields ?? {}) as Record<string, unknown>;
      return {
        id: hit._id,
        text: (fields.text as string) ?? '',
        title: (fields.title as string) ?? undefined,
        version: (fields.version as string) ?? undefined,
        quality: (fields.quality as string) ?? undefined,
        addonRequired: (fields.addon_required as string) ?? undefined,
        score: hit._score ?? 0,
      };
    });
  } catch (error) {
    console.error('[Pinecone] Search failed:', error);
    return [];
  }
}

/**
 * Format retrieved examples into a context string for the LLM.
 */
export function formatRAGContext(examples: readonly SkriptExample[]): string {
  if (examples.length === 0) return '';

  return examples
    .map((ex, i) => {
      const header = ex.title ? `### Example ${i + 1}: ${ex.title}` : `### Example ${i + 1}`;
      const meta = [
        ex.version && `Version: ${ex.version}`,
        ex.quality && `Quality: ${ex.quality}`,
        ex.addonRequired && ex.addonRequired !== 'none' && `Requires: ${ex.addonRequired}`,
        ex.score !== undefined && `Relevance: ${(ex.score * 100).toFixed(1)}%`,
      ].filter(Boolean).join(' | ');

      return `${header}\n${meta ? `*${meta}*\n` : ''}\n\`\`\`vb\n${ex.text}\n\`\`\``;
    })
    .join('\n\n');
}
