/* Built-in ChromeKit data — split out of chrome-kit.ts (200-LOC gate) and
   re-exported from there. Seed kits for the 6 shells that already register.
   Insets mirror today's hardcoded chrome (store-geometry's TOPBAR=30 /
   DOCK_RESERVE=92 for macOS; mobile shells reserve nothing). In full
   Phase A each block moves next to its shell module and the Surface reads
   insets from here instead of the imperative setChromeInsets call.

   P0 fidelity data (OS-FIDELITY-ULTRAPLAN.md): every OS kit now carries its
   motion pack, gesture profile, accent, icon-treatment axes and chrome font
   stack. Font vars (--font-inter/--font-roboto/--font-selawik) are next/font
   variables exposed on <html> by app/layout.tsx — next/font families get
   hashed names, so stacks MUST reference the var, not the plain family name. */
import type { ChromeKit, MotionProfile, TokenPack } from "./chrome-kit";

// Owner decision reversed 2026-07-02: the Apple shells ship an SF chrome stack
// (chrome only — brand surfaces keep Inter). Apple hardware resolves the REAL
// SF Pro; everyone else falls through Helvetica Neue → Inter.
const APPLE_UI_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", var(--font-inter, Inter), sans-serif';
const APPLE_MONO_FONT = '"SF Mono", ui-monospace, Menlo, monospace';

// Apple spring-decelerate (UIKit default-ish, no overshoot on window motion).
const APPLE_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
// UIKit interactive spring (damping ≈ 0.8, ~2% overshoot) approximated with
// linear() — evergreen-browser safe; falls back via --ease-spring's consumers.
const APPLE_SPRING =
  "linear(0, 0.008 1.1%, 0.031 2.2%, 0.129 4.8%, 0.257 7.2%, 0.671 14.2%, 0.789, 0.881 18.3%, 0.957 21.5%, 1.019 24.9%, 1.055 28.4%, 1.07 32.4%, 1.07 36.4%, 1.061 40.8%, 1.017 52.4%, 0.995 62%, 0.99 68.7%, 1 100%)";

const APPLE_MOTION: MotionProfile = {
  appOpen: { duration: "300ms", easing: APPLE_EASE },
  appClose: { duration: "250ms", easing: APPLE_EASE },
  windowSnap: { duration: "220ms", easing: APPLE_EASE },
  page: { duration: "350ms", easing: APPLE_EASE },
  ease: { standard: "cubic-bezier(0.25, 0.1, 0.25, 1)", decelerate: APPLE_EASE, spring: APPLE_SPRING },
};

// Popover elevation differs per OS: macOS menus soft+wide, Win11 flyouts
// tight, M3 menus the elevation-2 pair. OS-exact rgba values, tokenized here.
const POPOVER_MAC = "0 0 0 0.5px rgba(0, 0, 0, 0.12), 0 18px 40px -8px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.18)";
const POPOVER_IOS = "0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 16px 40px -8px rgba(0, 0, 0, 0.4)";
const POPOVER_WIN = "0 0 0 1px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.14)";
const POPOVER_M3 = "0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)";

const MACOS_TOKENS: Partial<TokenPack> = {
  radius: { window: "10px", icon: "22%", control: "8px" },
  glass: { enabled: 1, blur: "20px", saturate: "180%" },
  shadow: { popover: POPOVER_MAC },
  font: { ui: APPLE_UI_FONT, mono: APPLE_MONO_FONT },
  accent: "#0A82FF",
  icon: { gloss: 1, plate: 1 }, // Sonoma glossy tile — the one shell that keeps it
};

const IOS_TOKENS: Partial<TokenPack> = {
  radius: { window: "12px", icon: "22%", control: "8px" },
  shadow: { popover: POPOVER_IOS },
  font: { ui: APPLE_UI_FONT, mono: APPLE_MONO_FONT },
  accent: "#0A84FF",
  icon: { gloss: 0, plate: 1 }, // flat squircle, NO gloss and NO drop shadow
};

const WINDOWS_TOKENS: Partial<TokenPack> = {
  radius: { window: "8px", icon: "20%", control: "6px" },
  glass: { enabled: 1, blur: "30px", saturate: "130%" },
  shadow: { popover: POPOVER_WIN },
  // Mica: near-opaque, wallpaper/accent-tinted material — NOT macOS's live
  // blur vibrancy (--mica-win, appshell.css). One shared tint covers the
  // taskbar + titlebar (Mica proper) and the flyout/menu surfaces (Acrylic
  // reads as the same near-opaque family at this fidelity level).
  surface: { bar: "var(--mica-win)", menu: "var(--mica-win)", window: "var(--mica-win)", dock: "var(--mica-win)" },
  font: {
    ui: '"Segoe UI Variable Text", "Segoe UI", var(--font-selawik, Selawik), system-ui, sans-serif',
    mono: '"Cascadia Code", "Consolas", ui-monospace, monospace',
  },
  accent: "#0078D4", // Win11 default accent (sky-500 reads "Tailwind", not Windows)
  icon: { gloss: 0, plate: 0 }, // plate-less flat Fluent glyphs
};

const ANDROID_TOKENS: Partial<TokenPack> = {
  radius: { window: "16px", icon: "50%", control: "12px" }, // 50% = Pixel circle mask
  glass: { enabled: 0, blur: "0px", saturate: "100%" }, // M3: flat surface tint, no blur
  shadow: { popover: POPOVER_M3 },
  font: {
    ui: 'var(--font-roboto, Roboto), Roboto, "Noto Sans", system-ui, sans-serif',
    mono: '"Roboto Mono", ui-monospace, monospace',
  },
  accent: "#4C8DF6", // M3 baseline blue (owner-delegated pick); P4 dynamic color may reseed
  icon: { gloss: 0, plate: 1 }, // flat colored circle, zero gloss
};

export const BUILTIN_CHROME_KITS: ChromeKit[] = [
  {
    id: "macos", surface: "desktop", insets: { top: 30, bottom: 92 },
    layout: { kind: "windows", controls: "left-lights", launcher: "dock-magnify", menubar: "global-top" },
    tokens: MACOS_TOKENS,
    motion: APPLE_MOTION,
    gestures: { back: "none", appSwitch: "cmd-tab", home: "none", scrollBounce: true, pressFeedback: "scale" },
  },
  {
    id: "windows", surface: "desktop", insets: { top: 0, bottom: 48 },
    layout: { kind: "windows", controls: "right-caption", launcher: "taskbar", menubar: "in-window" },
    tokens: WINDOWS_TOKENS,
    motion: {
      // Fluent: fast decelerate in, accelerate out, "point-to-point" for snap.
      appOpen: { duration: "187ms", easing: "cubic-bezier(0, 0, 0, 1)" },
      appClose: { duration: "150ms", easing: "cubic-bezier(0.3, 0, 0.8, 0.15)" },
      windowSnap: { duration: "250ms", easing: "cubic-bezier(0.8, 0, 0.2, 1)" },
      page: { duration: "300ms", easing: "cubic-bezier(0.8, 0, 0.2, 1)" },
      // Fluent rarely springs — mild overshoot stands in where a spring is asked for.
      ease: { standard: "cubic-bezier(0.8, 0, 0.2, 1)", decelerate: "cubic-bezier(0, 0, 0, 1)", spring: "cubic-bezier(0.3, 1.25, 0.4, 1)" },
    },
    gestures: { back: "none", appSwitch: "cmd-tab", home: "none", scrollBounce: false, pressFeedback: "highlight" },
  },
  {
    id: "ios", surface: "mobile", insets: { top: 0, bottom: 0 },
    layout: { kind: "home-grid", columns: 4, appShape: "rounded-square", dock: "fixed-bottom", pages: true },
    tokens: IOS_TOKENS,
    motion: APPLE_MOTION,
    gestures: { back: "edge-swipe-left", appSwitch: "swipe-up-hold", home: "swipe-up", scrollBounce: true, pressFeedback: "scale" },
  },
  {
    // P4 android-home-layout-pixel: bumped 4→5 columns to match the real
    // Pixel launcher grid (visual QA 2026-07-02); icons round to circles via
    // radius.icon 50% (Pixel adaptive-icon mask).
    id: "android", surface: "mobile", insets: { top: 0, bottom: 0 },
    layout: { kind: "home-grid", columns: 5, appShape: "rounded-square", dock: "fixed-bottom", pages: true },
    tokens: ANDROID_TOKENS,
    motion: {
      // Material 3: emphasized-decelerate in, emphasized-accelerate out, standard snap.
      appOpen: { duration: "450ms", easing: "cubic-bezier(0.05, 0.7, 0.1, 1)" },
      appClose: { duration: "200ms", easing: "cubic-bezier(0.3, 0, 0.8, 0.15)" },
      windowSnap: { duration: "300ms", easing: "cubic-bezier(0.2, 0, 0, 1)" },
      page: { duration: "450ms", easing: "cubic-bezier(0.05, 0.7, 0.1, 1)" },
      ease: { standard: "cubic-bezier(0.2, 0, 0, 1)", decelerate: "cubic-bezier(0.05, 0.7, 0.1, 1)", spring: "cubic-bezier(0.34, 1.3, 0.64, 1)" },
    },
    // Android stretch-overscroll ≠ iOS rubber-band, so scrollBounce stays false.
    gestures: { back: "edge-swipe-left", appSwitch: "swipe-up-hold", home: "swipe-up", scrollBounce: false, pressFeedback: "ripple" },
  },
  {
    id: "mobile", surface: "mobile", insets: { top: 0, bottom: 0 },
    layout: { kind: "single-pane", nav: "bottom-tabs" },
  },
];
