"use client";
/* Appearance store — the real, persisted source behind the shell's
   useAppearance() capability (theme / wallpaper / device). Replaces the dead
   NOOP appearance in page.tsx, so the menu-bar toggle, control-center, ⌘K
   "switch theme", and the Settings app all drive one live state. Module
   singleton + useSyncExternalStore (mirrors the appshell store pattern);
   persisted to localStorage so it applies before first paint (no IDB async gate
   — theme must not flash). DATA stays in IndexedDB; this is config, like the
   widget layout. */
import { useSyncExternalStore } from "react";
import type { ShellAppearance, ThemeMode, DeviceMode } from "@/features/appshell";
import { parseImage, type ImageValue } from "@/features/image-picker";
import { applyPreset, clearPreset } from "@/lib/shared/theme-presets/apply";
import { wallpaperCss } from "./appearance-wallpaper";
import { applyBrand } from "./appearance-brand";

const KEY = "sv:appearance";

// "auto" follows the active shell's own wallpaper (per-OS fidelity); the rest
// are fixed presets. Classes live in features/appshell/appshell.css (.wp-*).
export const WALLPAPERS = ["auto", "aurora", "noir", "sunset", "ocean", "mono", "win11", "material", "ios"] as const;
export type Wallpaper = (typeof WALLPAPERS)[number];

interface State { theme: ThemeMode; wallpaper: Wallpaper; device: DeviceMode; brandHex: string | null; wallpaperImage: ImageValue | null; animations: boolean; notch: boolean; fontScale: number; highContrast: boolean; preset: string | null }

const DEFAULT: State = { theme: "light", wallpaper: "auto", device: "auto", brandHex: null, wallpaperImage: null, animations: true, notch: false, fontScale: 1, highContrast: false, preset: null };

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Accessibility text-size steps (root font-size multiplier). */
export const FONT_SCALES = [0.875, 1, 1.125, 1.25] as const;

/** OS-level "reduce motion" accessibility preference (false on the server). */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function load(): State {
  if (typeof localStorage === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT, animations: !prefersReducedMotion() }; // first visit → seed from OS pref
    const p = JSON.parse(raw) as Partial<State>;
    return {
      theme: p.theme === "dark" ? "dark" : "light",
      wallpaper: (WALLPAPERS as readonly string[]).includes(p.wallpaper as string) ? (p.wallpaper as Wallpaper) : "auto",
      device: p.device === "desktop" || p.device === "phone" ? p.device : "auto",
      brandHex: typeof p.brandHex === "string" && HEX.test(p.brandHex) ? p.brandHex : null,
      wallpaperImage: parseImage(p.wallpaperImage as ImageValue | null),
      // Honor the OS reduce-motion pref as the DEFAULT on first visit (no stored
      // value yet); once the user toggles it, their explicit choice is stored.
      animations: typeof p.animations === "boolean" ? p.animations : !prefersReducedMotion(),
      notch: p.notch === true,
      fontScale: (FONT_SCALES as readonly number[]).includes(p.fontScale as number) ? (p.fontScale as number) : 1,
      highContrast: p.highContrast === true,
      preset: typeof p.preset === "string" && p.preset ? p.preset : null,
    };
  } catch { return DEFAULT; }
}

let state: State = load();
const listeners = new Set<() => void>();

// brandHex is read by the Settings picker but is NOT part of the appshell
// ShellAppearance capability — it's applied directly to the DOM as CSS vars.
export type AppearanceState = ShellAppearance & { brandHex: string | null; wallpaperImage: ImageValue | null; animations: boolean; notch: boolean; fontScale: number; highContrast: boolean; preset: string | null };

// Stable snapshot — the shell wires setTheme into effect deps, so the returned
// object (and its setters) must keep identity until the state actually changes.
function build(): AppearanceState {
  return {
    theme: state.theme,
    wallpaper: state.wallpaper,
    device: state.device,
    brandHex: state.brandHex,
    wallpaperImage: state.wallpaperImage,
    animations: state.animations,
    notch: state.notch,
    fontScale: state.fontScale,
    highContrast: state.highContrast,
    preset: state.preset,
    // Custom image → CSS bag the appshell Wallpaper renders (wins over preset).
    wallpaperStyle: state.wallpaperImage ? wallpaperCss(state.wallpaperImage) : undefined,
    setTheme,
  };
}

let snapshot: AppearanceState = build();

function commit(next: Partial<State>) {
  state = { ...state, ...next };
  snapshot = build();
  if (typeof localStorage !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ }
  }
  applyTheme();
  listeners.forEach((l) => l());
}

/** Reflect theme + brand onto <html> so the CSS-var blocks take effect. */
export function applyTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", state.theme === "dark");
  // Animations off → kill all CSS transitions/animations app-wide (real toggle).
  root.classList.toggle("reduce-motion", !state.animations);
  // Animations explicitly ON → escape the OS prefers-reduced-motion baseline
  // (globals.css @media block), so the in-app toggle can override the OS pref.
  root.classList.toggle("force-motion", state.animations);
  // Accessibility: text scale (root rem) + high-contrast token overrides.
  root.style.fontSize = state.fontScale === 1 ? "" : `${state.fontScale * 100}%`;
  root.classList.toggle("high-contrast", state.highContrast);
  // Tweakcn theme preset — one injected <style> rethemes palette + chrome +
  // typeface (lib/theme-presets). Async (registry chunk lazy-loads); stock
  // tokens render until it lands. Inline brand vars below still win over the
  // injected tag, so a custom brand colour stays an override on any preset.
  if (state.preset) void applyPreset(state.preset);
  else clearPreset();
  applyBrand(root, state.brandHex);
}

export function setTheme(theme: ThemeMode) { commit({ theme }); }
/** Pick a named preset — clears any custom image wallpaper. */
export function setWallpaper(wallpaper: Wallpaper) { commit({ wallpaper, wallpaperImage: null }); }
/** Set a custom wallpaper from the image-picker (image/gradient/colour); null reverts to the preset. */
export function setWallpaperImage(wallpaperImage: ImageValue | null) { commit({ wallpaperImage }); }
export function setDevice(device: DeviceMode) { commit({ device }); }
/** Toggle app-wide motion. Off adds `.reduce-motion` to <html> (transitions die). */
export function setAnimations(animations: boolean) { commit({ animations }); }
/** Toggle the macOS-style menu-bar notch. */
export function setNotch(notch: boolean) { commit({ notch }); }
/** White-label accent from one hex; `null` reverts to the neutral theme. */
export function setBrand(brandHex: string | null) { commit({ brandHex }); }
/** Accessibility: root text scale (use FONT_SCALES steps). */
export function setFontScale(fontScale: number) { commit({ fontScale }); }
/** Accessibility: stronger borders + text contrast. */
export function setHighContrast(highContrast: boolean) { commit({ highContrast }); }
/** Pick a tweakcn theme preset by name; `null` restores the stock palette. */
export function setPreset(preset: string | null) { commit({ preset }); }

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

/** Current snapshot for non-React callers (palette commands). */
export function getAppearance(): AppearanceState { return snapshot; }

/** Drop-in for manifest.capabilities.useAppearance — stable + reactive.
 *  (Returns the superset AppearanceState; the capability consumes the
 *  ShellAppearance subset, the Settings app reads brandHex.) */
export function useAppearance(): AppearanceState {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}
