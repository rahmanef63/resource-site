import { resolveFontStack } from "./preset-fonts";

const STORAGE_KEY = "rahmanef:theme-preset";
const STYLE_ID = "theme-preset-vars";
const TRANSITION_CLASS = "theme-transition";
const TRANSITION_MS = 260;
const REGISTRY_URL = "/r/registry.json";

const COLOR_TOKENS = [
  "background", "foreground",
  "card", "card-foreground",
  "popover", "popover-foreground",
  "primary", "primary-foreground",
  "secondary", "secondary-foreground",
  "muted", "muted-foreground",
  "accent", "accent-foreground",
  "destructive", "destructive-foreground",
  "border", "input", "ring",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
  "sidebar", "sidebar-foreground",
  "sidebar-primary", "sidebar-primary-foreground",
  "sidebar-accent", "sidebar-accent-foreground",
  "sidebar-border", "sidebar-ring",
] as const;

const PASSTHROUGH_TOKENS = [
  "radius",
  "spacing",
  "letter-spacing",
  "tracking-normal", "tracking-tight", "tracking-tighter",
  "tracking-wide", "tracking-wider", "tracking-widest",
  "shadow-color", "shadow-opacity",
  "shadow-blur", "shadow-spread",
  "shadow-offset-x", "shadow-offset-y",
  "shadow-2xs", "shadow-xs", "shadow-sm", "shadow",
  "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl",
] as const;

const FONT_TOKENS = ["font-sans", "font-serif", "font-mono"] as const;

const OKLCH_RX = /^oklch\(\s*([^)]+?)\s*\)\s*$/;

function toRawOklch(v: string): string {
  const m = v.match(OKLCH_RX);
  return m ? m[1].trim() : v;
}

function buildBlock(selector: string, vars: Record<string, string>): string {
  const lines: string[] = [];
  for (const key of COLOR_TOKENS) {
    const v = vars[key];
    if (v) lines.push(`  --${key}: ${toRawOklch(v)};`);
  }
  for (const key of PASSTHROUGH_TOKENS) {
    const v = vars[key];
    if (v) lines.push(`  --${key}: ${v};`);
  }
  for (const key of FONT_TOKENS) {
    const v = vars[key];
    if (v) lines.push(`  --${key}: ${resolveFontStack(v)};`);
  }
  return `${selector} {\n${lines.join("\n")}\n}`;
}

export type PresetMeta = { name: string; title: string };

export type PresetFull = PresetMeta & {
  type: string;
  cssVars: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
};

type Registry = { items: PresetFull[] };

let cache: Registry | null = null;
let cachePromise: Promise<Registry> | null = null;

export async function loadRegistry(): Promise<Registry> {
  if (cache) return cache;
  if (cachePromise) return cachePromise;
  cachePromise = fetch(REGISTRY_URL, { cache: "force-cache" }).then(async (res) => {
    if (!res.ok) throw new Error(`registry fetch ${res.status}`);
    cache = (await res.json()) as Registry;
    return cache;
  });
  return cachePromise;
}

export async function listPresets(): Promise<PresetMeta[]> {
  const reg = await loadRegistry();
  return reg.items
    .filter((i) => i.type === "registry:style")
    .map((i) => ({ name: i.name, title: i.title }));
}

export async function listPresetsFull(): Promise<PresetFull[]> {
  const reg = await loadRegistry();
  return reg.items.filter((i) => i.type === "registry:style");
}

/** 5 signature swatches for dropdown preview. Merges theme+mode layer so what
 *  you see matches what writeVars() applies for the current theme mode. */
export function presetSwatches(preset: PresetFull, isDark = false): string[] {
  const theme = preset.cssVars.theme ?? {};
  const mode = isDark
    ? preset.cssVars.dark ?? preset.cssVars.light ?? {}
    : preset.cssVars.light ?? preset.cssVars.dark ?? {};
  const v: Record<string, string> = { ...theme, ...mode };
  if (isDark && preset.cssVars.dark && preset.cssVars.light) {
    // fallback: use light value if dark is missing a specific key
    for (const k of Object.keys(preset.cssVars.light)) {
      if (v[k] === undefined) v[k] = preset.cssVars.light[k];
    }
  }
  return [
    v.background ?? "oklch(1 0 0)",
    v.foreground ?? "oklch(0 0 0)",
    v.primary ?? "oklch(0.5 0.1 0)",
    v.accent ?? "oklch(0.5 0.1 180)",
    v.destructive ?? "oklch(0.6 0.2 25)",
  ];
}

function pulseTransition(): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.add(TRANSITION_CLASS);
  const w = window as any;
  if (w.__themeTxTimer) window.clearTimeout(w.__themeTxTimer);
  w.__themeTxTimer = window.setTimeout(() => {
    el.classList.remove(TRANSITION_CLASS);
  }, TRANSITION_MS);
}

async function writeVars(name: string): Promise<void> {
  const reg = await loadRegistry();
  const preset = reg.items.find((p) => p.name === name);
  if (!preset) return;
  const theme = preset.cssVars.theme ?? {};
  const light = preset.cssVars.light ?? {};
  const dark = preset.cssVars.dark ?? {};

  const blocks: string[] = [];
  if (Object.keys(theme).length) blocks.push(buildBlock(":root", theme));
  if (Object.keys(light).length) blocks.push(buildBlock(":root", light));

  // Dark mode: merge theme + light + dark so missing dark keys fall back to
  // light (avoids neo-brutalism defaults from globals.css bleeding through
  // when a preset doesn't define every color in its dark variant).
  const mergedDark: Record<string, string> = { ...theme, ...light, ...dark };
  if (Object.keys(mergedDark).length) blocks.push(buildBlock(".dark", mergedDark));

  injectStyleTag(blocks.join("\n\n"));
}

/** Commit preset: apply vars + persist to localStorage. */
export async function applyPreset(name: string | null): Promise<void> {
  pulseTransition();
  if (!name) {
    removeStyleTag();
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    return;
  }
  await writeVars(name);
  try { localStorage.setItem(STORAGE_KEY, name); } catch {}
}

/** Preview preset: apply vars, skip persistence. Use during hover. */
export async function previewPreset(name: string | null): Promise<void> {
  pulseTransition();
  if (!name) {
    removeStyleTag();
    return;
  }
  await writeVars(name);
}

/** Restore the saved preset (or clear if none). Use on dropdown mouse leave. */
export async function restoreSavedPreset(): Promise<void> {
  const saved = getSavedPreset();
  pulseTransition();
  if (!saved) {
    removeStyleTag();
    return;
  }
  await writeVars(saved);
}

function injectStyleTag(css: string): void {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function removeStyleTag(): void {
  document.getElementById(STYLE_ID)?.remove();
}

export function getSavedPreset(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export async function bootPreset(): Promise<void> {
  const saved = getSavedPreset();
  if (saved) await writeVars(saved);
}
