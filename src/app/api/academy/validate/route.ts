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
      const normalize = (code: string) =>
        code.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim().toLowerCase()
          .split('\n').map((line: string) => line.trim()).filter(Boolean).join('\n');

      const normalized = normalize(userSolution);
      const solution = normalize(lesson.solutionCode);

      const solutionLines = solution.split('\n');
      const userLines = normalized.split('\n');

      let matchedLines = 0;
      const errors: string[] = [];

      for (let i = 0; i < solutionLines.length; i++) {
        const sLine = solutionLines[i];
        if (userLines.some((uLine: string) => uLine.includes(sLine) || sLine.includes(uLine))) {
          matchedLines++;
        } else {
          errors.push(`Missing or incorrect: "${sLine}"`);
        }
      }

      const score = Math.round((matchedLines / solutionLines.length) * 100);
      const correct = score >= 75;

      return NextResponse.json({
        correct,
        errors,
        score,
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
