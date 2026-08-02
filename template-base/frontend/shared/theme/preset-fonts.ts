/** Map preset font-family primary name → loaded next/font CSS var. */
export const FONT_MAP: Record<string, string> = {
  "inter": "var(--font-inter)",
  "cormorant garamond": "var(--font-cormorant)",
  "dm sans": "var(--font-dm-sans)",
  "outfit": "var(--font-outfit)",
  "oxanium": "var(--font-oxanium)",
  "source serif 4": "var(--font-source-serif)",
  "merriweather": "var(--font-merriweather)",
  "lora": "var(--font-lora)",
  "jetbrains mono": "var(--font-jb-mono)",
  "fira code": "var(--font-fira-code)",
  "space mono": "var(--font-space-mono)",
};

export const DEFAULT_FONT_STACK = {
  "font-sans": "var(--font-inter), system-ui, sans-serif",
  "font-serif": "var(--font-cormorant), Georgia, serif",
  "font-mono": "var(--font-jb-mono), ui-monospace, monospace",
} as const;

/** Resolve preset font string (e.g. "DM Sans, sans-serif") to a loaded-font stack.
 *  If the primary family is loaded via next/font, prepend its var. Otherwise
 *  return the original stack (browser will attempt to load, or fall back). */
export function resolveFontStack(presetStack: string): string {
  const parts = presetStack.split(",");
  const primary = parts[0].trim().replace(/['"]/g, "").toLowerCase();
  const loaded = FONT_MAP[primary];
  return loaded ? `${loaded}, ${presetStack}` : presetStack;
}
