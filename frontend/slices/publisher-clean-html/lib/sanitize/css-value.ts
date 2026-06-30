// CSS-value sanitiser leaf. Lifted verbatim from Instatic
// `src/core/css-sanitize`. Zero dependencies — the single authority for CSS
// value sanitisation (inline styles, module CSS, framework tokens).
//
// Guards against: expression() (IE CSS-exec), javascript:, behavior: /
// -moz-binding (legacy code-exec), data:text/ (HTML via url()), { } (selector
// breakout), </ (HTML5 RAWTEXT escape from an inline <style>). `;` is NOT
// blocked — it is legitimate inside a quoted url("data:...;base64,...").

/** Returns the trimmed safe value, or null if it must be dropped. */
export function sanitiseCssValue(value: string | number): string | null {
  if (typeof value === "number") return String(value);
  const v = value.trim();
  if (/expression\s*\(/i.test(v)) return null;
  if (/javascript\s*:/i.test(v)) return null;
  if (/behavior\s*:/i.test(v)) return null;
  if (/-moz-binding/i.test(v)) return null;
  if (/data\s*:\s*text/i.test(v)) return null;
  if (/[{}]/.test(v)) return null;
  if (/<\//.test(v)) return null;
  return v;
}
