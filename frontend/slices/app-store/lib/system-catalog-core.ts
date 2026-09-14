export type SystemKind = "app" | "feature";

export type SystemEntryCore = {
  id: string;
  title: string;
  kind: SystemKind;
  glyph: string;
  gradient: string;
  desc: string;
  required?: boolean;
};

export const SYSTEM_CATALOG_CORE: SystemEntryCore[] = [
  { id: "files-manager", title: "Files", kind: "app", glyph: "folder", gradient: "linear-gradient(160deg,#3aa0ff,#1f6dff)", desc: "Browse, upload, and manage host files." },
  { id: "browser", title: "Browser", kind: "app", glyph: "globe", gradient: "linear-gradient(160deg,#22b1ff,#1666e0)", desc: "Drive a real headless Chromium on the VPS." },
  { id: "code-editor", title: "Code", kind: "app", glyph: "code", gradient: "linear-gradient(160deg,#7a5cff,#4f2fd6)", desc: "Edit host files in a tabbed code editor." },
  { id: "os-terminal", title: "Terminal", kind: "app", glyph: "terminal", gradient: "linear-gradient(160deg,#2b2f3a,#11141b)", desc: "Run shell commands on the host." },
  { id: "design-studio", title: "Design Studio", kind: "app", glyph: "image", gradient: "linear-gradient(160deg,#ff8a3d,#ff5fa2)", desc: "Photo & social-graphic design canvas." },
  { id: "reel-editor", title: "Video Editor", kind: "app", glyph: "video", gradient: "linear-gradient(160deg,#ff5fa2,#b13bff)", desc: "Timeline-based reel editing." },
  { id: "media-viewer", title: "Preview", kind: "app", glyph: "eye", gradient: "linear-gradient(160deg,#34d39a,#0f9e6a)", desc: "Quick-look images and media." },
  { id: "create-app", title: "Create App", kind: "app", glyph: "plus", gradient: "linear-gradient(160deg,#16c2c2,#0a8a8a)", desc: "Author a custom runtime app." },
  { id: "system-monitor", title: "System Monitor", kind: "app", glyph: "gauge", gradient: "linear-gradient(160deg,#f25f5c,#c0392b)", desc: "Live CPU, memory, and disk telemetry." },
  { id: "assistant", title: "Alfa", kind: "app", glyph: "sparkles", gradient: "linear-gradient(160deg,#7a5cff,#3aa0ff)", desc: "AI copilot for your VPS." },
  { id: "os-settings", title: "Settings", kind: "app", glyph: "settings", gradient: "linear-gradient(160deg,#5b6070,#2b2f3a)", desc: "Appearance, server mode, devices." },
  { id: "app-store", title: "App Store", kind: "app", glyph: "store", gradient: "linear-gradient(160deg,#9b5cff,#5b2fe0)", desc: "Install apps and toggle features.", required: true },
  { id: "search", title: "Spotlight", kind: "feature", glyph: "search", gradient: "linear-gradient(160deg,#6b7280,#374151)", desc: "⌘K command palette: open apps, run actions, search files." },
  { id: "inspector", title: "AI Inspector", kind: "feature", glyph: "panel", gradient: "linear-gradient(160deg,#7a5cff,#4f2fd6)", desc: "Right-docked properties panel + scoped AI chat (⌘I)." },
  { id: "notifications", title: "Notifications", kind: "feature", glyph: "bell", gradient: "linear-gradient(160deg,#f25f5c,#c0392b)", desc: "Toast stack + iOS dynamic-island live activities." },
  { id: "control-center", title: "Control Center", kind: "feature", glyph: "sliders", gradient: "linear-gradient(160deg,#22b1ff,#1666e0)", desc: "Mobile quick toggles (swipe down from the top)." },
  { id: "widgets", title: "Widgets", kind: "feature", glyph: "grid", gradient: "linear-gradient(160deg,#34d39a,#0f9e6a)", desc: "Mobile Today view with live system widgets." },
];

export const SYSTEM_GLYPH_SYMBOLS: Record<string, string> = {
  folder: "▰", globe: "◎", code: "</>", terminal: ">_", image: "◇", video: "▶", eye: "◉", plus: "+", gauge: "◴", sparkles: "✦", settings: "⚙", store: "▦", search: "⌕", panel: "▤", bell: "♢", sliders: "≡", grid: "▦",
};

export function systemGlyphSymbol(key: string): string {
  return SYSTEM_GLYPH_SYMBOLS[key] ?? "□";
}
