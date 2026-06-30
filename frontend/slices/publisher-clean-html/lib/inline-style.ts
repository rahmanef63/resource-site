// Serialise an inline-style bag to a sanitised CSS declaration string.
// Generic replacement for Instatic's bagToInlineStyle (which read the site
// framework token model): camelCase keys → kebab-case, each value run through
// sanitiseCssValue, null/unsafe values dropped.

import { sanitiseCssValue } from "./sanitize";

function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

/** `{ marginTop: 8, color: 'red' }` → `margin-top: 8; color: red`. */
export function bagToInlineStyle(bag: Record<string, unknown>): string {
  const decls: string[] = [];
  for (const [key, raw] of Object.entries(bag)) {
    if (raw == null || raw === "") continue;
    if (typeof raw !== "string" && typeof raw !== "number") continue;
    const value = sanitiseCssValue(raw);
    if (value == null) continue;
    decls.push(`${kebab(key)}: ${value}`);
  }
  return decls.join("; ");
}
