import type { FeatureType } from "../types";

export const VIEW_MODES = {
  TREE: "tree",
  GRID: "grid",
} as const;

export const TAB_TYPES = {
  INSTALLED: "installed",
  AVAILABLE: "available",
  IMPORT: "import",
} as const;

export const FEATURE_TYPES: Record<FeatureType, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  system: {
    label: "System",
    variant: "destructive",
  },
  optional: {
    label: "Optional",
    variant: "secondary",
  },
  default: {
    label: "Default",
    variant: "outline",
  },
  custom: {
    label: "Custom",
    variant: "outline",
  },
};

export const STATUS_BADGE_VARIANTS = {
  stable: "default",
  beta: "secondary",
  development: "outline",
  experimental: "outline",
  deprecated: "destructive",
} as const;

export const MENU_STORE_CONFIG = {
  previewPanelWidth: "w-96",
  gridColumns: {
    sm: "grid-cols-1",
    md: "md:grid-cols-2",
    lg: "lg:grid-cols-3",
  },
  maxDescriptionLines: "line-clamp-2",
} as const;
