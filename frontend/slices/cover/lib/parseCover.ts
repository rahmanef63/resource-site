/** Normalize a stored cover field into a CoverData object (or null). Keeps
 *  legacy raw-string covers working — raw URLs / CSS colours / gradients are
 *  detected and wrapped. Ported verbatim from notion-page-clone. */

import type { CoverData, CoverField } from "../types";

function looksLikeGradient(s: string): boolean {
  return /^(linear|radial|conic)-gradient\(/i.test(s.trim());
}

function looksLikeColor(s: string): boolean {
  const v = s.trim();
  return /^#[0-9a-f]{3,8}$/i.test(v)
    || /^(rgb|rgba|hsl|hsla)\(/i.test(v)
    || /^(red|blue|green|black|white|gray|grey|yellow|orange|purple|pink|brown)$/i.test(v);
}

function looksLikeUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim()) || /^storage:/i.test(s.trim());
}

export function parseCover(field: CoverField): CoverData | null {
  if (!field) return null;
  if (typeof field === "object") return field;
  const value = field.trim();
  if (!value) return null;
  if (looksLikeGradient(value)) return { type: "gradient", value, positionY: 50 };
  if (looksLikeColor(value)) return { type: "color", value, positionY: 50 };
  if (looksLikeUrl(value)) return { type: "link", value, positionY: 50 };
  return { type: "color", value, positionY: 50 };
}

/** color / gradient — value is a CSS background, no URL resolution needed. */
export function isCssCover(c: CoverData): boolean {
  return c.type === "color" || c.type === "gradient";
}

/** texture / upload / link / unsplash — value is an image URL or FileRef. */
export function isImageCover(c: CoverData): boolean {
  return !isCssCover(c);
}

/** Storage-backed (upload) covers need the host to resolve their FileRef. */
export function coverRef(c: CoverData | null): string | null {
  return c && c.type === "upload" ? c.value : null;
}
