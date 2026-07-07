/* Chrome Kit — the Phase-A foundation for the cloneable-shell architecture
   (docs/SHELL-CLONING-ARCHITECTURE.md §3). A ChromeKit is the per-OS pack that
   bundles EVERYTHING that makes a shell feel like a specific OS: its layout
   metaphor, chrome insets, and its token / motion / gesture packs.

   Wiring status: use-shell-tokens.ts applies tokenPackToVars() (tokens +
   motion) to <html> on shell switch and stamps `data-shell`, so appshell.css /
   globals.css can consume the vars and scope per-OS rules. The remaining
   Phase-A wiring (Surface reading kit.insets instead of the imperative
   setChromeInsets) is still a focused, visually-verified pass.

   Relationship to ShellDescriptor (registry/shells.tsx): a kit decorates a
   registered shell 1:1 by `id`. The shell still owns `render`; the kit owns the
   declarative skin/metaphor data the chrome refactor will read. */
import type { ShellId, ShellSurface } from "./shells";
import { BUILTIN_CHROME_KITS } from "./chrome-kit-data";

export { BUILTIN_CHROME_KITS } from "./chrome-kit-data";

// ── layout metaphor ──────────────────────────────────────────────────────────
export type ChromeLayout =
  | {
      kind: "windows"; // floating, draggable windows (macOS, Windows)
      controls: "left-lights" | "right-caption";
      launcher: "dock-magnify" | "taskbar" | "none";
      menubar: "global-top" | "in-window" | "none";
    }
  | {
      kind: "home-grid"; // full-screen apps + a home screen (iOS, Android)
      columns: number;
      appShape: "rounded-square" | "circle";
      dock: "fixed-bottom" | "none";
      pages: boolean;
    }
  | { kind: "single-pane"; nav: "sidebar" | "bottom-tabs" }; // dashboard

// ── skin pack ─────────────────────────────────────────────────────────────────
export type TokenPack = {
  radius: { window: string; icon: string; control: string };
  glass: { enabled: 0 | 1; blur: string; saturate: string };
  shadow: { window?: string; popover?: string };
  surface: { bar: string; menu: string; window: string; dock: string };
  font: { ui: string; mono: string };
  /** Per-OS accent (selection, Start logo, toggles) → --os-accent. */
  accent?: string;
  /** Icon treatment axes → --icon-gloss/--icon-plate: gloss = the Sonoma
      dome/bevel layers; plate = the colored tile behind the glyph. */
  icon?: { gloss: 0 | 1; plate: 0 | 1 };
};

export type MotionProfile = {
  appOpen: { duration: string; easing: string };
  appClose: { duration: string; easing: string };
  windowSnap: { duration: string; easing: string };
  page: { duration: string; easing: string };
  ease: { standard: string; decelerate: string; spring: string };
};

export type GestureProfile = {
  back: "edge-swipe-left" | "bottom-bar-swipe" | "none";
  appSwitch: "swipe-up-hold" | "recent-button" | "cmd-tab";
  home: "swipe-up" | "home-button" | "none";
  scrollBounce: boolean;
  pressFeedback: "scale" | "ripple" | "highlight" | "none";
};

/** Viewport-px chrome reserved by the shell (top bar / bottom dock or taskbar).
 *  Today each shell sets these imperatively via store-geometry's
 *  setChromeInsets; full Phase A moves them HERE so the Surface reads them. */
export type ChromeInsets = { top: number; bottom: number; left?: number; right?: number };

export type ChromeKit = {
  /** 1:1 with a registered ShellDescriptor (registry/shells.tsx). */
  id: ShellId;
  surface: ShellSurface;
  layout: ChromeLayout;
  insets: ChromeInsets;
  tokens?: Partial<TokenPack>;
  motion?: Partial<MotionProfile>;
  gestures?: Partial<GestureProfile>;
};

// ── registry ─────────────────────────────────────────────────────────────────
const KITS = new Map<ShellId, ChromeKit>();

export function registerChromeKit(kit: ChromeKit): void {
  KITS.set(kit.id, kit);
}
export function getChromeKit(id: ShellId): ChromeKit | undefined {
  return KITS.get(id);
}
export function chromeKitList(): ChromeKit[] {
  return [...KITS.values()];
}

/** Pure map of a (partial) MotionProfile → the motion CSS custom properties
 *  consumed by globals.css/appshell.css animations. DOM-free + unit-testable. */
export function motionToVars(motion: Partial<MotionProfile>): Record<string, string> {
  const vars: Record<string, string> = {};
  if (motion.appOpen) {
    vars["--motion-open-dur"] = motion.appOpen.duration;
    vars["--motion-open-ease"] = motion.appOpen.easing;
  }
  if (motion.appClose) {
    vars["--motion-close-dur"] = motion.appClose.duration;
    vars["--motion-close-ease"] = motion.appClose.easing;
  }
  if (motion.windowSnap) {
    vars["--motion-snap-dur"] = motion.windowSnap.duration;
    vars["--motion-snap-ease"] = motion.windowSnap.easing;
  }
  if (motion.page) {
    vars["--motion-page-dur"] = motion.page.duration;
    vars["--motion-page-ease"] = motion.page.easing;
  }
  if (motion.ease) {
    vars["--ease-standard"] = motion.ease.standard;
    vars["--ease-decel"] = motion.ease.decelerate;
    vars["--ease-spring"] = motion.ease.spring;
  }
  return vars;
}

/** Pure map of a (partial) TokenPack (+ optional MotionProfile) → CSS custom
 *  properties, matching the appshell.css token names. useShellTokens applies
 *  these to <html> on shell switch (the same mechanism lib/appearance.ts:
 *  applyBrand uses for the accent) — kept pure here so it is unit-testable. */
export function tokenPackToVars(
  tokens: Partial<TokenPack>,
  motion?: Partial<MotionProfile>,
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (tokens.radius) {
    if (tokens.radius.window) vars["--radius-win"] = tokens.radius.window;
    if (tokens.radius.icon) vars["--radius-icon"] = tokens.radius.icon;
    if (tokens.radius.control) vars["--radius-control"] = tokens.radius.control;
  }
  if (tokens.glass) {
    vars["--glass-enabled"] = String(tokens.glass.enabled);
    if (tokens.glass.blur) vars["--blur"] = tokens.glass.blur;
    if (tokens.glass.saturate) vars["--saturate"] = tokens.glass.saturate;
  }
  if (tokens.shadow?.window) vars["--shadow-win"] = tokens.shadow.window;
  if (tokens.shadow?.popover) vars["--shadow-popover"] = tokens.shadow.popover;
  if (tokens.surface) {
    if (tokens.surface.bar) vars["--glass-bar"] = tokens.surface.bar;
    if (tokens.surface.menu) vars["--glass-menu"] = tokens.surface.menu;
    if (tokens.surface.window) vars["--window-bg"] = tokens.surface.window;
    if (tokens.surface.dock) vars["--dock-bg"] = tokens.surface.dock;
  }
  if (tokens.font?.ui) vars["--font-os"] = tokens.font.ui;
  if (tokens.font?.mono) vars["--font-mono-os"] = tokens.font.mono;
  if (tokens.accent) vars["--os-accent"] = tokens.accent;
  if (tokens.icon) {
    vars["--icon-gloss"] = String(tokens.icon.gloss);
    vars["--icon-plate"] = String(tokens.icon.plate);
  }
  return motion ? { ...vars, ...motionToVars(motion) } : vars;
}

/** Populate the registry with the built-in kits (idempotent). */
export function registerBuiltinChromeKits(): void {
  BUILTIN_CHROME_KITS.forEach(registerChromeKit);
}

// Self-register on import (same pattern as registerShell at shell-module load),
// so getChromeKit() works for any consumer without an explicit bootstrap call.
registerBuiltinChromeKits();
