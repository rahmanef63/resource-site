// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import { applyPreset, readPreset } from "../lib/presets";

export function useThemePreset() {
  const [preset, setState] = React.useState<string>(() => readPreset());
  React.useEffect(() => { applyPreset(preset); }, [preset]);
  return [preset, setState] as const;
}
