import { AppError } from '@/lib/errors';

/**
 * Skripted — AI Judge Service
 * 
 * Uses specialized LLMs to verify user feedback and ensure high-quality RAG data.
 */

interface JudgeResult {
  trustScore: number;
  analysis: string;
  isVerified: boolean;
}

export class JudgeService {
  private static readonly API_KEY = process.env.JUDGE_OPENROUTER_API_KEY;
  private static readonly MODEL_ID = process.env.JUDGE_MODEL_ID || "nvidia/nemotron-3-super-120b-a12b:free";
  private static readonly API_URL = "https://openrouter.ai/api/v1/chat/completions";

  /**
   * Analyzes feedback by comparing the user's report with the generated code.
   */
  static async analyzeFeedback(
    prompt: string,
    generatedCode: string,
    userSuccess: boolean,
    errorLog?: string
  ): Promise<JudgeResult> {
    if (!this.API_KEY) {
      console.warn('[Judge] Missing API Key, skipping AI analysis.');
      return { trustScore: 0, analysis: "Skipped: Missing API Key", isVerified: false };
    }

    const systemPrompt = this.buildSystemPrompt(prompt, generatedCode, userSuccess, errorLog);

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://skripted.engine",
          "X-Title": "Skripted AI Judge"
        },
        body: JSON.stringify({
          model: this.MODEL_ID,
          messages: [{ role: "system", content: systemPrompt }],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw AppError.internal(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const rawVerdict = data.choices?.[0]?.message?.content;
      
      if (!rawVerdict) {
        throw AppError.internal("Empty response from AI Judge");
      }

      return this.parseVerdict(rawVerdict);
    } catch (error) {
      console.error('[Judge] Analysis failed:', error);
      // Fallback instead of throwing to prevent blocking feedback submission
      return { 
        trustScore: 0, 
        analysis: `Hata: Analiz motoru şu an meşgul.`, 
        isVerified: false 
      };
    }
  }

  private static buildSystemPrompt(prompt: string, generatedCode: string, userSuccess: boolean, errorLog?: string): string {
    return `You are the 'Skripted AI Judge'. Your job is to verify user feedback for validity.
Context:
1. User Request: ${prompt}
2. Generated Skript Code: 
\`\`\`sk
${generatedCode}
\`\`\`
3. User Reported Feedback: ${userSuccess ? "WORKS" : "FAILED"}
4. Reported Error Log: ${errorLog || "None reported"}

Instructions:
- Analyze if the Skript code correctly fulfills the user's request using modern Skript (2.14+) logic.
- If user says 'FAILED' but the code is perfect and prompt was clear, give a low trust score.
- If user says 'WORKS' but the code has obvious syntax errors, give a low trust score.
- Output EXACTLY in this JSON format:
{
  "trustScore": 0-100,
  "analysis": "Brief 1-sentence explanation in Turkish.",
  "isVerified": true/false
}`;
  }

  private static parseVerdict(raw: string): JudgeResult {
    try {
      const verdict = JSON.parse(raw);
      return {
        trustScore: Math.min(100, Math.max(0, Number(verdict.trustScore) || 0)),
        analysis: verdict.analysis || "Analiz yapılamadı.",
        isVerified: Boolean(verdict.isVerified)
      };
    } catch (e) {
      console.error('[Judge] JSON Parse Error:', e, raw);
      return { trustScore: 0, analysis: "AI yanıtı işlenemedi.", isVerified: false };
    }
  }
}
