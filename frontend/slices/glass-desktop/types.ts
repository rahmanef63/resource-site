// glass-desktop — authoritative contracts (Build Plan §6.1). Extend, don't diverge.
import type { ComponentType } from "react";

export type WidgetSize = "SP" | "S" | "WP" | "W" | "L";

export type WidgetFamily =
  | "time"
  | "timers"
  | "calendar"
  | "weather"
  | "media"
  | "system"
  | "utilities"
  | "social"
  | "people"
  | "finance"
  | "analytics";

export interface WidgetProps {
  instanceId: string;
  [k: string]: unknown;
}

export interface WidgetDef {
  id: string; // kebab, unique (§7 "id" column)
  family: WidgetFamily;
  size: WidgetSize;
  title: string; // aria-label + gallery caption
  component: ComponentType<WidgetProps>;
  defaultProps?: Record<string, unknown>; // variant data (ring metric, platform…)
}

export interface WidgetInstance {
  instanceId: string; // "ring-gauge:battery" style
  widgetId: string; // FK → registry
  space: 0 | 1;
  col: number; // grid cells, 0-based
  row: number;
  props?: Record<string, unknown>;
}

export interface LayoutStateV1 {
  version: 1;
  instances: WidgetInstance[];
}

export interface LayoutStore {
  // localStorage impl in utils/storage.ts (T6)
  load(): LayoutStateV1 | null; // null on missing/corrupt/version-mismatch
  save(state: LayoutStateV1): void;
  reset(): void;
}

export type GlassDesktopErrorCode = "STORAGE_UNAVAILABLE" | "REGISTRY_MISSING_WIDGET";

export type WidgetRegistry = Record<string, WidgetDef>;
