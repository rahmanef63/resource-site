import type { ComponentType } from "react";
import type { IconType } from "./icon";

// Home-screen widget model (iOS/macOS style). An app OPTIONALLY declares widgets
// on its AppDescriptor (catalog) → the registry aggregates them dynamically →
// they render on the Today page, the desktop widget layer, and the Widgets app,
// each at small / medium / large. DRY: declare once on the descriptor, appear
// everywhere. Pure types — no React/Convex deps.

export type WidgetSize = "small" | "medium" | "large";

export const WIDGET_SIZES: readonly WidgetSize[] = ["small", "medium", "large"] as const;

/** Pixel footprint per size (iOS 2×2-grid feel). The host sizes the frame; the
 *  widget body fills it and adapts content density to `size`. */
export const WIDGET_DIMS: Record<WidgetSize, { w: number; h: number }> = {
  small: { w: 170, h: 170 },
  medium: { w: 356, h: 170 },
  large: { w: 356, h: 356 },
};

export type WidgetRenderProps = {
  size: WidgetSize;
  /** Tap-through: open the owning (or any) OS app from the widget. */
  openApp: (appId: string, payload?: unknown) => void;
};

/** One widget an app exposes. An app may declare 1–3 of these (options). */
export type WidgetOption = {
  /** Stable id, unique within the app (e.g. "recent", "stats"). */
  id: string;
  label: string;
  /** phosphor-icons icon OR a custom SVG component (see IconType). */
  icon?: IconType;
  /** Sizes this option supports; defaults to all three. */
  sizes?: readonly WidgetSize[];
  /** Preferred size on surfaces that pick one (Today/desktop). Default "small". */
  defaultSize?: WidgetSize;
  /** Sort weight on glance surfaces (NC sheet / Today / Android) — higher first.
   *  Lets a hero widget (e.g. the portfolio identity) lead. Default 0. */
  priority?: number;
  /** Size-aware presentational component. Receives size + openApp. */
  render: ComponentType<WidgetRenderProps>;
};
