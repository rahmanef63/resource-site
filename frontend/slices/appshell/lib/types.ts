import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type WinId = string;

export type Rect = { x: number; y: number; w: number; h: number };

export type WindowState = {
  id: WinId;
  app: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  /** Saved rect for restore from maximize/snap. */
  prevRect?: Rect;
  /** Optional context handed to the app component (e.g. a file path to open). */
  payload?: unknown;
};

/** Props every app component receives. `payload` is whatever opened the window. */
export type AppProps = { payload?: unknown };

export type SnapZone = "left" | "right" | "top" | "tl" | "tr" | "bl" | "br";

export type ShellState = {
  windows: Record<WinId, WindowState>;
  order: WinId[];
  focused: WinId | null;
  launcherOpen: boolean;
  spotlightOpen: boolean;
  inspectorOpen: boolean;
};

/**
 * An OS app, contributed by a feature slice. os-shell never imports apps
 * directly — the app layer collects descriptors from each slice barrel and
 * passes them to <OsDesktop apps=… />. Open/closed: new app = new descriptor.
 */
export type AppDescriptor = {
  id: string;
  /** URL slug for deep-linking (`/files`); falls back to `id` when unset. */
  slug?: string;
  title: string;
  icon: LucideIcon;
  /** CSS gradient for the glossy dock/launcher icon (os-rr style). */
  gradient: string;
  /** Lazy-loaded so a window only pulls its app bundle when opened. */
  load: () => Promise<{ default: ComponentType<AppProps> }>;
  defaultSize?: { w: number; h: number };
  /** Hide from the dock (still launchable via launcher). */
  noDock?: boolean;
  /** Allow several windows at once (e.g. Files); default = single instance. */
  multi?: boolean;
};

/** Serialisable slice of a window persisted to Convex (no z/focus churn). */
export type PersistedWindow = Pick<
  WindowState,
  "id" | "app" | "title" | "x" | "y" | "w" | "h" | "minimized" | "maximized"
>;
