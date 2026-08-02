// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

export type Preset = { id: string; label: string };

export const presets: Preset[] = [
  { id: "zinc",     label: "Zinc" },
  { id: "slate",    label: "Slate" },
  { id: "rose",     label: "Rose" },
  { id: "emerald",  label: "Emerald" },
  { id: "amber",    label: "Amber" },
  { id: "violet",   label: "Violet" },
];

export const KEY = "rresource:theme:preset";

export function applyPreset(id: string) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = id;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, id);
}

export function readPreset(fallback = "zinc"): string {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(KEY) ?? fallback;
}
