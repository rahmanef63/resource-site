export const THEMES = {
  dark:  { bg: "bg-zinc-950 text-zinc-200", panel: "bg-zinc-900/60", editor: "bg-[#0b0b0e]", border: "border-zinc-800" },
  light: { bg: "bg-zinc-50 text-zinc-900",   panel: "bg-white/80",     editor: "bg-white",     border: "border-zinc-200" },
  sepia: { bg: "bg-[#f5f1e8] text-[#3a2f23]", panel: "bg-[#ede5d3]/80", editor: "bg-[#f5ebd7]",  border: "border-[#d8cba8]" },
};

export type ThemeId = keyof typeof THEMES;

export const TREE = [
  { name: "app", expanded: true, children: ["page.tsx", "layout.tsx", "globals.css"] },
  { name: "frontend", expanded: true, children: ["feature/", "shared/"] },
  { name: "convex", expanded: false, children: [] },
];
