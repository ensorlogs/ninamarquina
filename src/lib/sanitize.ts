import "server-only";

/**
 * Minimal server-side sanitizer for editor-generated article HTML.
 * Strips active content (scripts, iframes, forms), inline event handlers and
 * dangerous URL schemes. The author is always an admin, but this keeps a
 * stolen session or a pasted embed from injecting anything.
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<\s*(script|iframe|object|embed|form|link|meta|base|svg|math)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|form|link|meta|base|svg|math)\b[^>]*\/?\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["']?)\s*(javascript|data|vbscript)\s*:[^\s>"']*\2/gi, '$1="#"');
}
