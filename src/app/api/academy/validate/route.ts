import { NextRequest, NextResponse } from 'next/server';
import { getLessonById } from '@/lib/academy-data';

export const runtime = 'nodejs';

/**
 * Simple Levenshtein distance for fuzzy matching of strings
 */
function getSimilarity(s1: string, s2: string): number {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  
  const costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return (longerLength - costs[s2.length]) / longerLength;
}

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

    // 1. Normalization (Anti-Strict Protocol)
    // - Treat 1 TAB = 4 SPACES
    // - Remove extra whitespace
    const normalizeFull = (code: string) => {
      return code.replace(/\r\n/g, '\n')
                 .replace(/[ ]{4}/g, '\t') // Convert 4 spaces to TAB
                 .split('\n')
                 .map(line => line.trimEnd()) // Keep leading indentation for now
                 .filter(line => line.trim().length > 0)
                 .join('\n');
    };

    // Logic-only normalization (collapses all indentation)
    const normalizeLogic = (code: string) => {
      return code.replace(/\r\n/g, '\n')
                 .replace(/[ \t]+/g, ' ')
                 .trim()
                 .toLowerCase()
                 .split('\n')
                 .map(l => l.trim())
                 .filter(Boolean);
    };

    if (typeof userSolution === 'string') {
      const userLines = userSolution.split('\n');
      const solutionLinesRaw = lesson.solutionCode.split('\n');
      
      const normalizedUserLogic = normalizeLogic(userSolution);
      const normalizedSolutionLogic = normalizeLogic(lesson.solutionCode);

      let matchedLogicCount = 0;
      let lintWarnings: string[] = [];
      let errorCode: string | null = null;

      // 2. Intent-Based & Keyword Check
      // We iterate through mandatory logic parts of the solution
      for (const sLine of normalizedSolutionLogic) {
        // Handle fuzzy matching for messages (strings in quotes)
        const quoteMatch = sLine.match(/"([^"]+)"/);
        if (quoteMatch) {
          const coreLogic = sLine.replace(quoteMatch[0], '___STR___');
          const solutionStr = quoteMatch[1];
          
          let foundFuzzy = false;
          for (const uLine of normalizedUserLogic) {
            const uQuoteMatch = uLine.match(/"([^"]+)"/);
            if (uQuoteMatch) {
              const uCoreLogic = uLine.replace(uQuoteMatch[0], '___STR___');
              const userStr = uQuoteMatch[1];
              
              if (uCoreLogic === coreLogic && getSimilarity(userStr, solutionStr) >= 0.8) {
                foundFuzzy = true;
                break;
              }
            }
          }
          if (foundFuzzy) matchedLogicCount++;
        } else {
          // Direct keyword/logic match
          if (normalizedUserLogic.some(u => u.includes(sLine) || sLine.includes(u))) {
            matchedLogicCount++;
          }
        }
      }

      // 3. Syntax & Indentation Linting
      // Check if indents are missing where colons exist
      for (let i = 0; i < userLines.length; i++) {
        const line = userLines[i];
        const trimmed = line.trim();
        if (trimmed.endsWith(':')) {
          const nextLine = userLines[i + 1];
          if (nextLine && !nextLine.startsWith('\t') && !nextLine.startsWith('    ')) {
            lintWarnings.push(`Line ${i + 1}: Missing indentation after colon.`);
            errorCode = 'ERR_INDENT';
          }
        }
      }

      // 4. Output Logic
      const logicScore = (matchedLogicCount / normalizedSolutionLogic.length) * 100;
      const isCorrect = logicScore >= 90; // Logic is correct but might have lint warnings
      
      // Virtual Simulation Data
      const virtualOutputs = [];
      if (isCorrect) {
        if (userSolution.includes('broadcast')) virtualOutputs.push({ type: 'broadcast', text: 'Announcement: Match started!' });
        if (userSolution.includes('send')) virtualOutputs.push({ type: 'send', text: 'To you: Hello Developer!' });
        if (userSolution.includes('permission')) virtualOutputs.push({ type: 'permission', text: 'Checking skript.admin... Success' });
      }

      return NextResponse.json({
        correct: isCorrect,
        logicScore,
        errorCode,
        lintWarnings,
        virtualOutputs,
        xpEarned: isCorrect ? lesson.xpReward : 0,
        feedback: isCorrect 
          ? (lintWarnings.length > 0 ? "Correct Logic! (Pırlanda gibi kod, ama biraz girinti hatası var şampiyon)" : "Perfect!")
          : "Logic incomplete. Try focusing on the objective."
      });
    }

    // Default catch-all for blocks (same logic as before but more lenient if needed)
    return NextResponse.json({ correct: false, error: 'Incompatible input' }, { status: 400 });
  } catch (err: any) {
    console.error('[Academy Validate] Error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
