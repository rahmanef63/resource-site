// Theme preset loader — sources theme definitions from
// `/r/registry.json` (verbatim copy of the tweakcn theme registry, 36 items).
//
// 1. Fetch registry.json once, cache in module state. If the fetch
//    fails (404, network error), fall back to EMBEDDED_FALLBACK so the
//    switcher still renders with at least one preset.
// 2. Build CSS block: `:root { --x: …; }` + `.dark { --x: …; }`.
//    Color values pass through verbatim (kitab Tailwind v4 `@theme inline`
//    expects full `oklch(L C H)` strings — DO NOT strip the wrapper).
// 3. Inject as a single `<style id="theme-preset-vars">` tag in <head>.
// 4. Pulse `html.theme-transition` class for 260 ms around every swap.
// 5. Entry points: applyPreset (commit + persist), previewPreset (hover),
//    restoreSavedPreset (mouse leave), bootPreset (page load).

import { rewriteFontValue } from "./registry-fonts";

const resolveFontStack = rewriteFontValue;

const STORAGE_KEY = "rahman-resources:theme-preset";
const STYLE_ID = "theme-preset-vars";
const TRANSITION_CLASS = "theme-transition";
const TRANSITION_MS = 260;
const REGISTRY_URL = "/r/registry.json";

export const DEFAULT_PRESET_NAME = "modern-minimal";

export interface ThemePresetItem {
  name: string;
  title: string;
  type?: string;
  description?: string;
  cssVars?: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
}

export interface ThemeRegistry {
  name: string;
  items: ThemePresetItem[];
}

const COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

const COLOR_ALIAS: Readonly<Record<string, string>> = {
  sidebar: "sidebar-background",
};

const PASSTHROUGH_TOKENS = [
  "radius",
  "spacing",
  "letter-spacing",
  "tracking-normal",
  "tracking-tight",
  "tracking-tighter",
  "tracking-wide",
  "tracking-wider",
  "tracking-widest",
  "shadow-color",
  "shadow-opacity",
  "shadow-blur",
  "shadow-spread",
  "shadow-offset-x",
  "shadow-offset-y",
  "shadow-2xs",
  "shadow-xs",
  "shadow-sm",
  "shadow",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
] as const;

const FONT_TOKENS = ["font-sans", "font-serif", "font-mono"] as const;

function buildBlock(
  selector: string,
  vars: Record<string, string>,
): string | null {
  const lines: string[] = [];
  for (const key of COLOR_TOKENS) {
    const v = vars[key];
    if (!v) continue;
    const outKey = COLOR_ALIAS[key] ?? key;
    lines.push(`  --${outKey}: ${v};`);
    if (COLOR_ALIAS[key]) {
      lines.push(`  --${key}: ${v};`);
    }
  }
  for (const key of PASSTHROUGH_TOKENS) {
    const v = vars[key];
    if (v) lines.push(`  --${key}: ${v};`);
  }
  for (const key of FONT_TOKENS) {
    const v = vars[key];
    if (v) lines.push(`  --${key}: ${resolveFontStack(v)};`);
  }
  if (!lines.length) return null;
  return `${selector} {\n${lines.join("\n")}\n}`;
}

// Embedded fallback — used when /r/registry.json fails to load (404,
// network error, CSP block). Mirrors kitab's baseline globals.css so
// the switcher still has at least the default preset to display, and
// applyPreset() never throws even offline.
const EMBEDDED_FALLBACK: ThemeRegistry = {
  name: "rahman-resources-fallback",
  items: [
    {
      name: DEFAULT_PRESET_NAME,
      title: "Modern Minimal (fallback)",
      cssVars: {
        light: {
          background: "oklch(1 0 0)",
          foreground: "oklch(0.145 0 0)",
          card: "oklch(1 0 0)",
          "card-foreground": "oklch(0.145 0 0)",
          popover: "oklch(1 0 0)",
          "popover-foreground": "oklch(0.145 0 0)",
          primary: "oklch(0.205 0 0)",
          "primary-foreground": "oklch(0.985 0 0)",
          secondary: "oklch(0.97 0 0)",
          "secondary-foreground": "oklch(0.205 0 0)",
          muted: "oklch(0.97 0 0)",
          "muted-foreground": "oklch(0.45 0 0)",
          accent: "oklch(0.97 0 0)",
          "accent-foreground": "oklch(0.205 0 0)",
          destructive: "oklch(0.577 0.245 27.325)",
          "destructive-foreground": "oklch(0.985 0 0)",
          border: "oklch(0.92 0 0)",
          input: "oklch(0.92 0 0)",
          ring: "oklch(0.708 0 0)",
          radius: "0.5rem",
        },
        dark: {
          background: "oklch(0.141 0.005 285.823)",
          foreground: "oklch(0.985 0 0)",
          card: "oklch(0.18 0.006 285.5)",
          "card-foreground": "oklch(0.985 0 0)",
          popover: "oklch(0.18 0.006 285.5)",
          "popover-foreground": "oklch(0.985 0 0)",
          primary: "oklch(0.985 0 0)",
          "primary-foreground": "oklch(0.205 0 0)",
          secondary: "oklch(0.235 0.006 285.5)",
          "secondary-foreground": "oklch(0.985 0 0)",
          muted: "oklch(0.235 0.006 285.5)",
          "muted-foreground": "oklch(0.708 0.011 286.067)",
          accent: "oklch(0.235 0.006 285.5)",
          "accent-foreground": "oklch(0.985 0 0)",
          destructive: "oklch(0.396 0.141 25.723)",
          "destructive-foreground": "oklch(0.985 0 0)",
          border: "oklch(0.275 0.008 286)",
          input: "oklch(0.275 0.008 286)",
          ring: "oklch(0.439 0 0)",
          radius: "0.5rem",
        },
      },
    },
  ],
};

let registryCache: ThemeRegistry | null = null;
let registryPromise: Promise<ThemeRegistry> | null = null;

export async function loadRegistry(): Promise<ThemeRegistry> {
  if (registryCache) return registryCache;
  if (registryPromise) return registryPromise;
  registryPromise = fetch(REGISTRY_URL, { cache: "force-cache" })
    .then((r) => {
      if (!r.ok) throw new Error(`registry.json ${r.status}`);
      return r.json() as Promise<ThemeRegistry>;
    })
    .then((data) => {
      const items = data.items.filter(
        (i) => i.cssVars?.light && i.cssVars?.dark,
      );
      registryCache = { ...data, items };
      return registryCache;
    })
    .catch(() => {
      // Network/parse failure → serve the embedded fallback so the UI
      // still renders. Cached so we don't re-attempt the failed fetch.
      registryCache = EMBEDDED_FALLBACK;
      return registryCache;
    });
  return registryPromise;
}

export function findPreset(
  registry: ThemeRegistry,
  name: string,
): ThemePresetItem | undefined {
  return registry.items.find((i) => i.name === name);
}

export function presetSwatches(preset: ThemePresetItem): string[] {
  const v = preset.cssVars?.light ?? preset.cssVars?.dark ?? {};
  return [
    v.background ?? "oklch(1 0 0)",
    v.foreground ?? "oklch(0 0 0)",
    v.primary ?? "oklch(0.5 0.1 259)",
    v.accent ?? "oklch(0.5 0.1 200)",
    v.destructive ?? "oklch(0.6 0.2 25)",
  ];
}

function injectStyleTag(css: string): void {
  if (typeof document === "undefined") return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function removeStyleTag(): void {
  if (typeof document === "undefined") return;
  document.getElementById(STYLE_ID)?.remove();
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null;

function pulseTransition(): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.add(TRANSITION_CLASS);
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    el.classList.remove(TRANSITION_CLASS);
    transitionTimer = null;
  }, TRANSITION_MS);
}

async function writeVars(name: string): Promise<void> {
  const reg = await loadRegistry();
  const preset = findPreset(reg, name);
  if (!preset) return;
  const blocks: string[] = [];
  const theme = preset.cssVars?.theme;
  const light = preset.cssVars?.light;
  const dark = preset.cssVars?.dark;
  if (theme) {
    const b = buildBlock(":root", theme);
    if (b) blocks.push(b);
  }
  if (light) {
    const b = buildBlock(":root", light);
    if (b) blocks.push(b);
  }
  if (dark) {
    const b = buildBlock(".dark", dark);
    if (b) blocks.push(b);
  }
  injectStyleTag(blocks.join("\n\n"));
}

export async function applyPreset(name: string | null): Promise<void> {
  pulseTransition();
  if (!name || name === DEFAULT_PRESET_NAME) {
    removeStyleTag();
    try {
      if (name === DEFAULT_PRESET_NAME) {
        localStorage.setItem(STORAGE_KEY, name);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    return;
  }
  await writeVars(name);
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // ignore
  }
}

export async function previewPreset(name: string | null): Promise<void> {
  pulseTransition();
  if (!name || name === DEFAULT_PRESET_NAME) {
    removeStyleTag();
    return;
  }
  await writeVars(name);
}

export async function restoreSavedPreset(): Promise<void> {
  const saved = getSavedPreset();
  pulseTransition();
  if (!saved || saved === DEFAULT_PRESET_NAME) {
    removeStyleTag();
    return;
  }
  await writeVars(saved);
}

export function getSavedPreset(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function bootPreset(): Promise<void> {
  const saved = getSavedPreset();
  if (!saved || saved === DEFAULT_PRESET_NAME) return;
  await writeVars(saved);
}
