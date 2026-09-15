// glass-desktop — renderer-neutral authoritative contracts.

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
  [key: string]: unknown;
}

export interface WidgetDescriptor {
  id: string;
  family: WidgetFamily;
  size: WidgetSize;
  title: string;
  defaultProps?: Record<string, unknown>;
}

export type WidgetCatalog = Record<string, WidgetDescriptor>;

export interface WidgetInstance {
  instanceId: string;
  widgetId: string;
  space: 0 | 1;
  col: number;
  row: number;
  props?: Record<string, unknown>;
}

export interface LayoutStateV1 {
  version: 1;
  instances: WidgetInstance[];
}

export interface LayoutStore {
  load(): LayoutStateV1 | null;
  save(state: LayoutStateV1): void;
  reset(): void;
}

export type GlassDesktopErrorCode = "STORAGE_UNAVAILABLE" | "REGISTRY_MISSING_WIDGET";
