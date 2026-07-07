import { loadPresetRegistry, findPreset } from "./registry";
import { ensurePresetFonts, clearPresetFonts } from "./fonts";
import { PRESET_STYLE_ID, type PresetItem } from "./types";

// Applies a tweakcn preset with ONE injected <style> tag, two layers deep:
//
//  1. The preset's shadcn palette (background / card / primary / …) is injected
//     verbatim into `:root` + `.dark` — globals.css maps these to Tailwind
//     colors via `@theme inline`, so every app surface rethemes directly.
//  2. The appshell CHROME tokens (--surface, --glass-*, --window-*, --dock-bg)
//     are hardcoded rgba values in appshell.css, NOT derived from the palette —
//     so we derive them here from the preset's palette (same recipe as os-vps's
//     chrome derivation). Alpha layers use color-mix so any color format works.
//
// Dark mode keys off the `.dark` class (this app's convention, set by
// lib/appearance applyTheme — NOT os-vps's [data-theme="dark"]).

const mix = (c: string, pct: number) =>
  `color-mix(in oklab, ${c} ${pct}%, transparent)`;

// theme-level keys that are NOT palette colors — handled separately (fonts,
// radius) or meaningless as injected color vars.
const SKIP = /^(font-|tracking-|letter-spacing|spacing)/;

function paletteVars(v: Record<string, string>): string[] {
  return Object.entries(v)
    .filter(([k]) => !SKIP.test(k))
    .map(([k, val]) => `--${k}: ${val};`);
}

function chromeVars(
  v: Record<string, string>,
  mode: "light" | "dark",
): string[] {
  const bg = v.background ?? (mode === "dark" ? "oklch(0.2 0 0)" : "oklch(1 0 0)");
  const fg = v.foreground ?? (mode === "dark" ? "oklch(0.95 0 0)" : "oklch(0.15 0 0)");
  const card = v.card ?? bg;
  const popover = v.popover ?? card;
  const lines = [
    `--surface: ${bg};`,
    `--glass-bar: ${mix(bg, 62)};`,
    `--glass-menu: ${mix(popover, 86)};`,
    `--window-bg: ${mix(card, 86)};`,
    `--window-head: ${mix(card, 55)};`,
    `--hover-strong: ${mix(fg, mode === "dark" ? 14 : 9)};`,
    `--dock-bg: ${mix(card, mode === "dark" ? 42 : 34)};`,
  ];
  if (v.primary) lines.push(`--os-accent: ${v.primary};`);
  return lines;
}

// High-contrast a11y must keep winning over the (later-in-cascade) injected
// block, so re-derive its border/text overrides from the preset palette.
function contrastVars(v: Record<string, string>, mode: "light" | "dark"): string[] {
  const fg = v.foreground ?? (mode === "dark" ? "oklch(0.95 0 0)" : "oklch(0.15 0 0)");
  return [
    `--border: ${mix(fg, 55)};`,
    `--muted-foreground: ${mix(fg, 90)};`,
    `--ring: ${mix(fg, 75)};`,
  ];
}

const block = (selector: string, lines: string[]) =>
  `${selector} {\n  ${lines.join("\n  ")}\n}`;

export function buildCss(preset: PresetItem): string {
  const light = preset.cssVars?.light ?? {};
  const dark = preset.cssVars?.dark ?? {};
  const blocks = [
    block(":root", [...paletteVars(light), ...chromeVars(light, "light")]),
    block(".dark", [...paletteVars(dark), ...chromeVars(dark, "dark")]),
    block(".high-contrast", contrastVars(light, "light")),
    block(".high-contrast.dark", contrastVars(dark, "dark")),
  ];
  // Theme-level tokens (font + radius) so type, corners, and color all retheme
  // from ONE preset — the preset IS the typeface config, there is no separate
  // font picker. applyPreset() also loads the named webfonts (see ./fonts.ts);
  // Inter stays the fallback while they stream / offline. `--font-ui` feeds
  // globals.css's `--font-sans: var(--font-ui, var(--font-inter))` seam —
  // injected on :root, it can't fight the next/font body-class var.
  const theme = preset.cssVars?.theme ?? {};
  const rootTheme: string[] = [];
  const radius = theme.radius ?? light.radius;
  if (radius) rootTheme.push(`--radius: ${radius};`);
  if (theme["font-sans"])
    rootTheme.push(`--font-ui: ${theme["font-sans"]}, var(--font-inter), system-ui, sans-serif;`);
  if (theme["font-mono"])
    rootTheme.push(`--font-mono-ui: ${theme["font-mono"]}, ui-monospace, monospace;`);
  if (rootTheme.length) blocks.push(block(":root", rootTheme));
  return blocks.join("\n\n");
}

/** Injects (or replaces) the preset style tag. No persistence here — the
 *  lib/appearance store owns that via its `preset` field. */
export async function applyPreset(name: string): Promise<void> {
  const registry = await loadPresetRegistry();
  const preset = findPreset(registry, name);
  if (!preset) return;
  let el = document.getElementById(PRESET_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = PRESET_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = buildCss(preset);
  // The vars only render if the named faces exist — fetch them (no-op for
  // local/system stacks; offline degrades to the Inter fallback in the stack).
  ensurePresetFonts(preset.cssVars?.theme ?? {});
}

/** Removes the injected preset vars + webfonts — back to the stock palette. */
export function clearPreset(): void {
  document.getElementById(PRESET_STYLE_ID)?.remove();
  clearPresetFonts();
}
