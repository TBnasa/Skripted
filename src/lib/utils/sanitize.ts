/**
 * Simple HTML sanitization to prevent basic XSS attacks.
 * In a production environment, a library like DOMPurify or sanitize-html should be used.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips all HTML tags from a string.
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
}
