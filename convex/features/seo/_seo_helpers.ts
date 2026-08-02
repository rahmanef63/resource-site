// Pure helpers for SEO action: clamping, dedup, JSON parsing.
// Split out of `actions.ts` (LOC cap).

import type { GenOut } from "./_seo_types";

export const clamp = (s: string, max: number): string =>
  s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";

export const dedupKeywords = (kw: string[]): string[] => {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const k of kw) {
    const norm = k.toLowerCase().trim();
    if (!norm) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
    if (out.length >= 10) break;
  }
  return out;
};

export const safeParse = (raw: string): GenOut | null => {
  // Strip accidental fences if the model misbehaves.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    const obj = JSON.parse(cleaned) as Partial<GenOut>;
    if (typeof obj.seoTitle !== "string") return null;
    if (typeof obj.metaDescription !== "string") return null;
    if (!Array.isArray(obj.keywords)) return null;
    if (typeof obj.focusKeyphrase !== "string") return null;
    return {
      seoTitle: clamp(obj.seoTitle.trim(), 60),
      metaDescription: clamp(obj.metaDescription.trim(), 160),
      keywords: dedupKeywords(obj.keywords.filter((k): k is string => typeof k === "string")),
      focusKeyphrase: obj.focusKeyphrase.trim(),
      structuredType:
        typeof obj.structuredType === "string" ? obj.structuredType : undefined,
    };
  } catch {
    return null;
  }
};
