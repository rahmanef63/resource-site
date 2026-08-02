// Splice author classes + inline styles onto the ROOT element of a node's
// rendered HTML — never a nested descendant. Lifted from Instatic
// `src/core/publisher/classInjection.ts`; the classId→class-name resolution
// (which read site.styleRules) is dropped — here classIds ARE the class names.

import { escapeHtml } from "./sanitize";
import { bagToInlineStyle } from "./inline-style";

// First opening element tag (skips <!--, <!DOCTYPE, <?xml). `[^>]*` is safe
// because module render() escapes attribute values.
const ROOT_TAG = /<([a-zA-Z][\w-]*)\b([^>]*)>/;

function injectAttr(
  html: string,
  attr: string,
  value: string,
  merge: (existing: string) => string,
): string {
  const match = html.match(ROOT_TAG);
  if (!match) return html;
  const [full, tag, attrs] = match;
  const start = match.index ?? 0;

  const re = new RegExp(`\\b${attr}="([^"]*)"`);
  const existing = attrs.match(re);
  const newAttrs = existing
    ? attrs.replace(re, `${attr}="${merge(existing[1])}"`)
    : ` ${attr}="${value}"${attrs}`;

  return html.slice(0, start) + `<${tag}${newAttrs}>` + html.slice(start + full.length);
}

/** Prepend author class names onto the root element (preserving cascade order). */
export function injectNodeClassIds(
  html: string,
  classIds: readonly string[] | undefined,
): string {
  if (!classIds?.length) return html;
  const classAttr = classIds.map(escapeHtml).join(" ");
  if (!classAttr) return html;
  return injectAttr(html, "class", classAttr, (existing) => `${classAttr} ${existing}`);
}

/** Merge author inline styles onto the root element (author declarations win). */
export function injectNodeInlineStyles(
  html: string,
  inlineStyles: Record<string, unknown> | undefined,
): string {
  if (!inlineStyles || Object.keys(inlineStyles).length === 0) return html;
  const styleAttr = bagToInlineStyle(inlineStyles);
  if (!styleAttr) return html;
  const escaped = escapeHtml(styleAttr);
  return injectAttr(
    html,
    "style",
    escaped,
    (existing) => `${existing.replace(/;\s*$/, "")}; ${escaped}`,
  );
}
