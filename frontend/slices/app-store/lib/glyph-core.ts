export const GLYPH_KEYS = ["grid", "code", "globe", "image", "music", "gauge", "folder", "cloud"] as const;

export type GlyphKey = (typeof GLYPH_KEYS)[number];

export const GLYPH_SYMBOLS: Record<string, string> = {
  grid: "▦",
  code: "</>",
  globe: "◎",
  image: "◇",
  music: "♪",
  gauge: "◴",
  folder: "▰",
  cloud: "☁",
};

export function glyphSymbol(key: string): string {
  return GLYPH_SYMBOLS[key] ?? "□";
}
