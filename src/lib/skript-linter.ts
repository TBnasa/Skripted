/**
 * Skripted — Lightweight Skript Syntax Linter
 * 
 * This linter provides real-time feedback for common Skript errors 
 * like missing colons, indentation issues, and unknown keywords.
 */

import type { editor } from 'monaco-editor';
import { SKRIPT_LANGUAGE_ID } from './skript-language';

// Marker Severity Constants
const ERROR = 8; // monaco.MarkerSeverity.Error
const WARNING = 4; // monaco.MarkerSeverity.Warning

interface LinterMarker {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: number;
}

/**
 * Validates the content of a Skript file and returns Monaco markers.
 */
export function validateSkript(model: editor.ITextModel): LinterMarker[] {
  const lines = model.getLinesContent();
  const markers: LinterMarker[] = [];
  
  let usesTabs = false;
  let usesSpaces = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    const trimmed = line.trim();
    
    // 1. Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indentation = line.match(/^(\s*)/)?.[0] || '';
    
    // 2. Indentation Consistency Check
    if (indentation.includes('\t')) usesTabs = true;
    if (indentation.includes('  ')) usesSpaces = true;

    if (usesTabs && usesSpaces) {
      markers.push({
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: indentation.length + 1,
        message: 'Mixed tabs and spaces! Skript is sensitive to indentation consistency.',
        severity: WARNING
      });
      // Reset to prevent spamming on every line, but we know there's an issue
      usesTabs = false;
      usesSpaces = false;
    }

    // 3. Missing Colon Check
    // Rules: on, if, else, while, loop, command, function should end with ":"
    const blockKeywords = ['on', 'if', 'else', 'while', 'loop', 'command', 'function', 'options', 'variables'];
    const firstWord = trimmed.split(' ')[0].toLowerCase();
    
    if (blockKeywords.includes(firstWord) && !trimmed.endsWith(':')) {
      markers.push({
        startLineNumber: lineNumber,
        startColumn: line.indexOf(trimmed) + 1,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
        message: `Missing colon (:) at the end of the ${firstWord} block.`,
        severity: ERROR
      });
    }

    // 4. Unexpected Colon Check
    // Skript effects (send, teleport, etc.) should NOT end with a colon unless they are nested (which is rare in core)
    const commonEffects = ['send', 'message', 'broadcast', 'teleport', 'give', 'kill', 'set', 'add', 'remove', 'delete'];
    if (commonEffects.includes(firstWord) && trimmed.endsWith(':') && !trimmed.includes('to run:')) {
       markers.push({
        startLineNumber: lineNumber,
        startColumn: line.length,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
        message: 'Unexpected colon at the end of an effect.',
        severity: WARNING
      });
    }

    // 5. Variable Brace Check
    const openBraces = (trimmed.match(/\{/g) || []).length;
    const closeBraces = (trimmed.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      markers.push({
        startLineNumber: lineNumber,
        startColumn: line.indexOf('{') + 1,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
        message: 'Unmatched variable braces {}. Ensure every { has a closing }.',
        severity: ERROR
      });
    }

    // 6. Indentation Depth Check (Simple)
    // If the previous line ended with a colon, this line MUST be indented more than the previous one
    if (i > 0) {
      const prevLine = lines[i - 1].trim();
      const prevIndent = lines[i - 1].match(/^(\s*)/)?.[0].length || 0;
      const currentIndent = indentation.length;

      if (prevLine.endsWith(':') && currentIndent <= prevIndent && !trimmed.startsWith('else')) {
        markers.push({
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: indentation.length + 1,
          message: 'This line should be indented after a block declaration.',
          severity: ERROR
        });
      }
    }
  }

  return markers;
}

/**
 * Attaches the linter to a Monaco Editor instance.
 */
export function setupSkriptLinter(editorInstance: editor.IStandaloneCodeEditor, monaco: any) {
  const model = editorInstance.getModel();
  if (!model || model.getLanguageId() !== SKRIPT_LANGUAGE_ID) return;

  const validate = () => {
    const markers = validateSkript(model);
    monaco.editor.setModelMarkers(model, 'skript-linter', markers);
  };

  // Initial validation
  validate();

  // Validate on content change (debounced)
  let timeout: any;
  const disposable = model.onDidChangeContent(() => {
    clearTimeout(timeout);
    timeout = setTimeout(validate, 500);
  });

  return () => {
    disposable.dispose();
    clearTimeout(timeout);
  };
}
