// Inline-SVG sanitisation — DOMPurify SVG profile. Returns '' when no runtime
// is configured (fail-closed; stripping would empty the SVG anyway).

import { getDOMPurify, type SanitizerConfig } from "./runtime";

const SVG_CONFIG: SanitizerConfig = {
  USE_PROFILES: { svg: true, svgFilters: true },
  // Defence in depth: no HTML embedding, no script, no anchors carrying hrefs.
  FORBID_TAGS: ["script", "foreignObject", "a"],
  FORBID_ATTR: ["xlink:href", "href"],
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/** Sanitise inline-SVG markup for safe inclusion in published HTML. */
export function sanitizeSvg(value: unknown): string {
  const str = String(value ?? "");
  if (!str.trim()) return "";
  const purifier = getDOMPurify();
  if (!purifier || typeof purifier.sanitize !== "function") return "";
  return String(purifier.sanitize(str, SVG_CONFIG));
}
