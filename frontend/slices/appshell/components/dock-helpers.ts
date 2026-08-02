import type { AppDescriptor, WindowState } from "../lib/types";

// ── macOS dock magnification ─────────────────────────────────────────────────
// Icon size is driven by LAYOUT width so the glass bar actually grows + re-centres
// as icons magnify. Crucially the magnification CONSERVES total width: a FIXED
// pool of extra width (DOCK_EXTRA) is shared out among icons by a gaussian weight,
// so the bar has just TWO widths — collapsed at rest, one stable expanded size on
// hover — instead of fluctuating as the cursor moves. Icons are square, so the bar
// grows in height too. Distance is measured against each slot's FIXED rest centre
// (the centre-justified row's centre x is invariant under symmetric growth), so
// there's no measure→grow feedback.
export const BASE = 50; // resting icon px
export const SEP_W = 13; // divider slot px
export const GAP = 8; // px between slots
export const MAG_SIGMA = 100; // bell-curve spread (≈3 icons each side ripple)
export const DOCK_EXTRA = 340; // pool px shared by gaussian weight (peak icon ≈ +DOCK_EXTRA/restNorm)

// A dock slot: a fixed-height (BASE) layout box that owns the WIDTH (so the bar
// keeps a constant height while it expands sideways), holding an absolute,
// bottom-anchored icon ZONE sized w×w that OVERFLOWS upward — the magnified icon
// rises out of the bar (in front of it) instead of sitting inside. width + height
// transition so hover-in/out (and the redistribution as the cursor moves) glide.
export const SLOT_TRANS = "transition-[width] duration-200 ease-out";
export const ZONE_TRANS = "transition-[height] duration-200 ease-out";

export type Slot =
  | { kind: "app"; app: AppDescriptor; windows: WindowState[] }
  | { kind: "sep" }
  | { kind: "plain"; id: string; label: string; onClick: () => void; node: React.ReactNode };
