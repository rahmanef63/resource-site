// Prop escaping — every string prop is escaped BEFORE a module's render() sees
// it, dispatched on the prop's declared control `type` in the schema (NOT
// guessed from the key name). Lifted from Instatic
// `src/core/publisher/escapeProps.ts`.
//
//  - url | image | media → isSafeUrl (unsafe → '#'); NOT HTML-escaped here, so
//    the module's own safeUrl() doesn't double-escape query-string ampersands.
//  - richtext → sanitizeRichtext (injected DOMPurify; strip fallback)
//  - svg → sanitizeSvg (SVG profile)
//  - everything else, AND any key absent from the schema → escapeHtml (safe default)
//  - non-string values pass through unchanged (derived assets survive the boundary)

import type { PropertyControl, PropertySchema } from "./types";
import { escapeHtml, isSafeUrl, sanitizeRichtext, sanitizeSvg } from "./sanitize";

// Resolve the control for `key`. `group` controls hold children under .children
// but DON'T nest the data shape (group is visual-only), so recurse one level.
function controlForKey(schema: PropertySchema, key: string): PropertyControl | undefined {
  const direct = schema[key];
  if (direct) return direct;
  for (const control of Object.values(schema)) {
    if (control.type === "group" && control.children) {
      const child = controlForKey(control.children, key);
      if (child) return child;
    }
  }
  return undefined;
}

export function escapeProps(
  props: Record<string, unknown>,
  schema: PropertySchema,
): Record<string, unknown> {
  const escaped: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value !== "string") {
      escaped[key] = value;
      continue;
    }

    const type = controlForKey(schema, key)?.type;

    if (type === "svg") {
      escaped[key] = sanitizeSvg(value);
    } else if (type === "richtext") {
      escaped[key] = sanitizeRichtext(value);
    } else if (type === "url" || type === "image" || type === "media") {
      // Safe URLs pass through raw so the module's safeUrl() escapes once.
      escaped[key] = isSafeUrl(value) ? value : "#";
    } else {
      // Plain strings + any unknown-to-schema prop: HTML-escape (safe default).
      escaped[key] = escapeHtml(value);
    }
  }

  return escaped;
}
