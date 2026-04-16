/**
 * Skripted — Code Extractor Utility
 * 
 * Safely extracts Skript/Code blocks from AI model responses.
 */
export function extractCode(content: string): string {
  if (!content) return '';
  
  // Try to find code blocks with sk, vsk, or no language tag
  const codeBlockRegex = /```(?:sk|vsk|skript)?\n([\s\S]*?)```/i;
  const match = content.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: If no backticks but looks like skript, return as is (rare)
  if (content.includes('command /') || content.includes('on ')) {
    return content.trim();
  }

  return '';
}
