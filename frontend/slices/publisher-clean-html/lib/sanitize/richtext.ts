// Richtext sanitisation — DOMPurify when a runtime is injected, conservative
// tag-stripping fallback otherwise. Default config allows safe formatting tags
// and blocks all script execution.

import { getDOMPurify, stripHtmlFallback, type SanitizerConfig } from "./runtime";

const RICHTEXT_CONFIG: SanitizerConfig = {
  ALLOWED_TAGS: [
    "p", "br",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "del", "ins",
    "a", "ul", "ol", "li",
    "blockquote", "code", "pre",
    "span", "div",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "id"],
  ADD_ATTR: ["target"],
  ALLOW_DATA_ATTR: false,
  NAMESPACE: "http://www.w3.org/1999/xhtml",
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/** Strip ALL markup — for fields that must never carry HTML (titles, meta). */
export const PLAIN_TEXT_CONFIG: SanitizerConfig = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  _plainText: true,
};

/**
 * Sanitize a richtext value. With an injected runtime it returns safe rich HTML;
 * without one it strips every tag (fail-closed). Pass PLAIN_TEXT_CONFIG to force
 * plain text.
 */
export function sanitizeRichtext(
  value: unknown,
  config: SanitizerConfig = RICHTEXT_CONFIG,
): string {
  const str = String(value ?? "");
  if (!str.trim()) return "";

  const purifier = getDOMPurify();
  if (!purifier || typeof purifier.sanitize !== "function") {
    const stripped = stripHtmlFallback(str);
    return config._plainText ? stripped.trim() : stripped;
  }

  const sanitized = String(purifier.sanitize(str, config));
  if (config._plainText) return sanitized.replace(/<[^>]*>/g, "").trim();
  return sanitized;
}

/** Key-name heuristic: does this prop key refer to richtext/html content? */
export function isRichtextPropKey(key: string): boolean {
  const k = key.toLowerCase();
  return k === "richtext" || k === "html" || k.endsWith("html") || k.endsWith("richtext");
}
