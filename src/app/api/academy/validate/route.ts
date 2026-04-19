import { NextRequest, NextResponse } from 'next/server';
import { getLessonById } from '@/lib/academy-data';

export const runtime = 'nodejs';

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

    // Block-based validation
    if (Array.isArray(userSolution)) {
      const solutionIds = lesson.solution;
      const userIds = userSolution.map((b: { id: string }) => b.id);

      if (userIds.length !== solutionIds.length) {
        return NextResponse.json({
          correct: false,
          errors: [`Expected ${solutionIds.length} blocks, got ${userIds.length}`],
          score: Math.round((Math.min(userIds.length, solutionIds.length) / solutionIds.length) * 50),
          xpEarned: 0,
        });
      }

      const errors: string[] = [];
      let correctCount = 0;

      for (let i = 0; i < solutionIds.length; i++) {
        if (userIds[i] === solutionIds[i]) {
          correctCount++;
        } else {
          errors.push(`Block ${i + 1}: expected "${solutionIds[i]}", got "${userIds[i]}"`);
        }
      }

      const score = Math.round((correctCount / solutionIds.length) * 100);
      const correct = score === 100;

      return NextResponse.json({
        correct,
        errors,
        score,
        xpEarned: correct ? lesson.xpReward : 0,
      });
    }

    // Code-based validation (string comparison)
    if (typeof userSolution === 'string') {
      // Logic Check: TAB vs space usage
      const hasSpaces = /^[ ]{1,}/m.test(userSolution);
      const hasTabs = /\t/.test(userSolution);
      
      // Robust normalization: Treat all consecutive whitespace as single space
      const normalize = (code: string) =>
        code.replace(/\r\n/g, '\n')
          .replace(/[ \t]+/g, ' ')
          .trim()
          .toLowerCase()
          .split('\n')
          .map((line: string) => line.trim())
          .filter(Boolean)
          .join('\n');

      const normalized = normalize(userSolution);
      const solution = normalize(lesson.solutionCode);

      const solutionLines = solution.split('\n');
      const userLines = normalized.split('\n');

      let matchedLines = 0;
      const missingLines: string[] = [];

      for (let i = 0; i < solutionLines.length; i++) {
        const sLine = solutionLines[i];
        if (userLines.some((uLine: string) => uLine.includes(sLine) || sLine.includes(uLine))) {
          matchedLines++;
        } else {
          missingLines.push(sLine);
        }
      }

      const score = Math.round((matchedLines / solutionLines.length) * 100);
      
      // Logic Check: If the logic is mostly correct but failing
      // Give feedback about TAB usage if suspicious
      const suggestions = [];
      if (score >= 70 && hasSpaces && !hasTabs) {
        suggestions.push("Hint: Use TAB backslash instead of spaces for indentation!");
      }

      // 85% match is considered "correct" to account for minor wording differences
      // while focusing on logical structure.
      const correct = score >= 85;

      return NextResponse.json({
        correct,
        errors: missingLines.length > 0 ? [`Code is missing logic for: ${missingLines.join(', ')}`] : [],
        score,
        suggestions,
        isLogicCorrect: score >= 90, // For mentor to know if it's "Diamond" code but synth-err
        xpEarned: correct ? lesson.xpReward : 0,
      });
    }

    return NextResponse.json({ error: 'Invalid solution format' }, { status: 400 });
  } catch (err: any) {
    console.error('[Academy Validate] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
