"use client";

import type { ReactNode } from "react";
import type { LayoutStore } from "../types";
import { DesktopShell } from "./shell/desktop-shell";
import { WidgetGallery } from "./config/widget-gallery";

export interface GlassDesktopProps {
  /** Which space is active on first paint. */
  initialSpace?: 0 | 1;
  /** Layout persistence adapter (defaults to the localStorage adapter). */
  store?: LayoutStore;
  /** Brand shown in the menu bar. Portability prop — no hardcoded consumer brand. */
  brand?: { name: string; glyph?: ReactNode };
  /** Render the widget gallery (QA surface) instead of the desktop. */
  gallery?: boolean;
}

/**
 * Lucent Desktop — the full interactive glass desktop surface. Composes the
 * desktop shell (wallpaper + spaces + widget canvas + menu bar). Widgets are
 * add / remove / resize / drag-configurable and persist to localStorage.
 * `gallery` swaps in a captioned grid of every registered widget.
 */
export function GlassDesktop({ brand, store, gallery }: GlassDesktopProps) {
  // TODO(rr): thread initialSpace into SpacePager's default (persisted space wins today).
  if (gallery) return <WidgetGallery />;
  return <DesktopShell brand={brand} store={store} />;
}
