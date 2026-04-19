import { NextRequest, NextResponse } from 'next/server';
import { getLessonById } from '@/lib/academy-data';
import { chatCompletion } from '@/lib/openrouter';

export const runtime = 'nodejs';

/**
 * AI-Powered Semantic Validator
 * Replaces rigid string matching with intent-based LLM analysis.
 */
export async function POST(request: NextRequest) {
  try {
    const { lessonId, userSolution } = await request.json();

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
    }

    const lesson = getLessonById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Prepare context for LLM
    const systemPrompt = `
### ROLE: SKRIPT CODE VALIDATOR (HIGH-PRECISION)
You are a semantic compiler for the Skript language (Minecraft). Your goal is to evaluate if a student's code achieves the FUNCTIONAL INTENT of the lesson.

### VALIDATION PROTOCOL:
1. **Semantic Flexibility**: Ignore minor string differences inside "send" or "broadcast" messages. (e.g. "Welcome" is same as "Welcome to server").
2. **Indentation Rule**: Accept both 1 TAB and 4 SPACES as valid indentation. Do NOT fail the user for space-based indentation alone, but note it in lint_advice.
3. **Logic Priority**: Check if mandatory keywords (trigger, if, else, permissions) are present and correctly nested.
4. **Boss Level Strictness**: If the lesson is a "Boss Level", be slightly more critical of structure.

### LESSON CONTEXT:
- **Lesson Title**: ${lesson.title_en}
- **Objective**: ${lesson.objective_en}
- **Ideal Solution**: 
\`\`\`skript
${lesson.solutionCode}
\`\`\`

### OUTPUT FORMAT:
You MUST return a JSON object ONLY. No conversational text.
{
  "success": boolean,
  "specific_error": "Detailed reason in Turkish if code is wrong, otherwise empty.",
  "lint_advice": "Technical advice in Turkish about indentation or style.",
  "virtual_outputs": [
    {"type": "broadcast" | "send" | "permission", "text": "Specific feedback for the simulator"}
  ]
}
`;

    const userPrompt = `
STUDENT'S CODE:
\`\`\`skript
${userSolution}
\`\`\`

Evaluate now.
`;

    const aiResponse = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    // Parse AI Response
    try {
      // Find JSON block if AI added fluff (though told not to)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const result = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);

      return NextResponse.json({
        correct: result.success,
        feedback: result.success ? "Harika! Mantık tamamen doğru." : result.specific_error,
        lintWarnings: result.lint_advice ? [result.lint_advice] : [],
        virtualOutputs: result.virtual_outputs || [],
        xpEarned: result.success ? lesson.xpReward : 0,
        errorCode: result.success ? null : (result.specific_error.toLowerCase().includes('girinti') ? 'ERR_INDENT' : 'ERR_LOGIC')
      });
    } catch (parseError) {
      console.error('[Academy Validate] Parse Error:', aiResponse);
      // Fallback if AI output is messy
      return NextResponse.json({
        correct: false,
        feedback: "Doğrulama motoru geçici bir hata aldı. Lütfen tekrar dene.",
        lintWarnings: [],
        virtualOutputs: [],
        xpEarned: 0
      });
    }

  } catch (err: any) {
    console.error('[Academy Validate] Error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
