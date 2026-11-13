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
    .replace(/[\s/]on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/[\s/](href|src)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, (m, attr: string, raw: string) =>
      /^(javascript|data|vbscript):/i.test(decodeEntities(raw.replace(/^["']|["']$/g, "")).replace(/[\s\u0000-\u001f]+/g, ""))
        ? ` ${attr}="#"`
        : m,
    );
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => codePoint(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_, d) => codePoint(Number(d)))
    .replace(/&(colon|tab|newline);/gi, (_, n: string) => ({ colon: ":", tab: "\t", newline: "\n" })[n.toLowerCase()] ?? "");
}

const codePoint = (n: number) => (n <= 0x10ffff ? String.fromCodePoint(n) : "");
