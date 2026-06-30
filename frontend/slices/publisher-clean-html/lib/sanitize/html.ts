// HTML + URL sanitisation leaf. Lifted verbatim from Instatic
// `src/core/html-sanitize`. Zero dependencies — the escaping authority shared
// by escapeProps, class injection, and the document shell.

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

/** HTML-escape the five characters dangerous in HTML text + attribute contexts. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

/**
 * True when a URL is safe for href/src/action attributes. Blocks javascript:,
 * vbscript:, and data: schemes after the tab/newline normalisation browsers
 * apply during URL parsing.
 */
export function isSafeUrl(url: string): boolean {
  const normalized = url.replace(/[\t\n\r]/g, "").trim().toLowerCase();
  return (
    !normalized.startsWith("javascript:") &&
    !normalized.startsWith("vbscript:") &&
    !normalized.startsWith("data:")
  );
}

/** Validate + HTML-escape a URL for attribute interpolation. Unsafe → "#". */
export function safeUrl(value: unknown): string {
  const str = String(value ?? "");
  if (!isSafeUrl(str)) return "#";
  return escapeHtml(str);
}
