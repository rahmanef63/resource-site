// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import { presets } from "../lib/presets";
import { useThemePreset } from "../hooks/useThemePreset";

export function ThemePresetSwitcher({ className }: { className?: string }) {
  const [preset, setPreset] = useThemePreset();
  return (
    <select value={preset} onChange={(e) => setPreset(e.target.value)} className={className ?? "rounded border bg-background px-2 py-1 text-sm"}>
      {presets.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
    </select>
  );
}
