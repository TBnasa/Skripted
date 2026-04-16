/**
 * Skripted — Code Extractor Utility
 * 
 * Safely extracts Skript/Code blocks from AI model responses.
 */
export function extractCode(content: string): string {
  if (!content) return '';
  
  // Sadece Skript ile ilgili etiketleri veya 'on ' ile başlayan blokları yakala
  const codeBlockRegex = /```(?:sk|vsk|skript)\n([\s\S]*?)```/gi;
  let matches = [...content.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    // En son (genellikle güncel olan) skript bloğunu al
    return matches[matches.length - 1][1].trim();
  }

  // Eğer dil etiketi yoksa ama kod bloğu varsa ve içinde Skript anahtar kelimeleri geçiyorsa
  const genericRegex = /```\n?([\s\S]*?)```/gi;
  let genericMatches = [...content.matchAll(genericRegex)];
  for (const match of genericMatches) {
    const code = match[1].trim();
    if (code.includes('command /') || code.includes('on ') || code.includes('options:')) {
      return code;
    }
  }

  return '';
}
