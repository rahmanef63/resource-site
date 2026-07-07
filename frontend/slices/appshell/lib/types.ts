import type { ComponentType } from "react";
import type { IconType } from "./icon";
import type { WidgetOption } from "./widget-types";

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
  /** The zone this window is snapped to. Kept so a shell switch (different
   *  chrome insets) can re-tile snapped/maximized windows into the new work
   *  area instead of leaving frozen geometry. Cleared on free move/resize. */
  snapZone?: SnapZone;
  /** Optional context handed to the app component (e.g. a file path to open). */
  payload?: unknown;
  /** Always-on-top: rendered above the regular stack (PiP-style). */
  pinned?: boolean;
  /** Virtual desktop this window lives on (default 1). */
  spaceId?: number;
  /** Tab group — members render as ONE tabbed frame (top-z member shows). */
  groupId?: string;
};

/** Props every app component receives. `payload` is whatever opened the window. */
export type AppProps = { payload?: unknown };

export type SnapZone =
  | "left" | "right" | "top"
  | "tl" | "tr" | "bl" | "br"
  // tiling presets: thirds (left/right ⅓ and ⅔ columns)
  | "l13" | "l23" | "r13" | "r23";

export type ShellState = {
  windows: Record<WinId, WindowState>;
  order: WinId[];
  focused: WinId | null;
  /** Active virtual desktop (Spaces) — windows on other spaces stay hidden. */
  activeSpace: number;
  launcherOpen: boolean;
  spotlightOpen: boolean;
  inspectorOpen: boolean;
  notificationCenterOpen: boolean;
};

/** App Store category — groups apps in the store + docs. */
export type AppCategory =
  | "productivity"
  | "data"
  | "media"
  | "developer"
  | "system"
  | "utilities";

/** A store badge; mirrors superspace's appStore.badge. */
export type AppBadge = "new" | "featured" | "updated" | "popular";

/**
 * An OS app, contributed by a feature slice. os-shell never imports apps
 * directly — the app layer collects descriptors from each slice barrel and
 * passes them to <OsDesktop apps=… />. Open/closed: new app = new descriptor.
 *
 * Beyond the runtime fields (icon/load/size), an app carries optional STORE +
 * DOCS metadata (description/category/badge/highlights/…). The App Store and the
 * Docs app read this one shape — adding rich metadata to an app surfaces it in
 * both with no extra wiring (the "dynamic template" contract).
 */
export type AppDescriptor = {
  id: string;
  /** URL slug for deep-linking (`/files`); falls back to `id` when unset. */
  slug?: string;
  title: string;
  /** phosphor-icons icon OR a custom SVG component (see IconType). */
  icon: IconType;
  /** CSS gradient for the glossy dock/launcher icon (os-rr style). */
  gradient: string;
  /** Lazy-loaded so a window only pulls its app bundle when opened. */
  load: () => Promise<{ default: ComponentType<AppProps> }>;
  defaultSize?: { w: number; h: number };
  /** Hide from the dock (still launchable via launcher). */
  noDock?: boolean;
  /** Allow several windows at once (e.g. Files); default = single instance. */
  multi?: boolean;
  /** System/default app (Settings, Files, Trash, Media, App Store, …) vs a
   *  custom workspace app (Dashboard, Database, Notion). Drives App Store
   *  grouping; system apps are the OS baseline, custom apps are the user's. */
  system?: boolean;

  // ── Store + Docs metadata (all optional) ──────────────────────────────────
  /** One-line summary, shown on store cards + dock tooltips. */
  description?: string;
  /** Store/docs category. Defaults to "system" for system apps, else "data". */
  category?: AppCategory;
  /** Author / team for the store listing. */
  author?: string;
  /** Semver-ish version string for the store listing. */
  version?: string;
  /** Search keywords (matched by the store + ⌘K). */
  tags?: string[];
  /** Full markdown-ish blurb shown on the store/docs detail. */
  longDescription?: string;
  /** Bullet feature highlights for the store detail. */
  highlights?: string[];
  /** Store badge ribbon. */
  badge?: AppBadge;

  /** macOS menu-bar menus contributed by THIS app when it's focused. Each menu
   *  is a top-bar dropdown (File / Edit / custom). When unset the shell shows the
   *  generic File/Edit/View defaults — so apps opt in to a richer menu bar. */
  menus?: AppMenu[];

  /** Home-screen widgets this app exposes (iOS/macOS style). 1–3 options, each
   *  rendering at small/medium/large. Optional — apps opt in. Aggregated by the
   *  widget registry and shown on the Today page, desktop widget layer, and the
   *  Widgets app with no extra wiring. */
  widgets?: WidgetOption[];
};

/** A single menu-bar dropdown (e.g. "File") with its rows. */
export type AppMenu = { label: string; items: AppMenuItem[] };
/** A row in an app menu; `{ sep: true }` draws a divider. */
export type AppMenuItem =
  | { sep: true }
  | {
      sep?: false;
      label: string;
      /** Keyboard hint shown right-aligned (display only, e.g. "⌘S"). */
      shortcut?: string;
      onSelect?: () => void;
      disabled?: boolean;
    };

/** Serialisable slice of a window persisted to Convex (no z/focus churn). */
export type PersistedWindow = Pick<
  WindowState,
  "id" | "app" | "title" | "x" | "y" | "w" | "h" | "minimized" | "maximized" | "pinned" | "spaceId" | "groupId"
>;
