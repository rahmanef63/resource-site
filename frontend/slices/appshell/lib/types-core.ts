export type WinId = string;
export type Rect = { x: number; y: number; w: number; h: number };
export type SnapZone =
  | "left" | "right" | "top"
  | "tl" | "tr" | "bl" | "br"
  | "l13" | "l23" | "r13" | "r23";

export type WindowState = {
  id: WinId;
  app: string;
  title: string;
  x: number; y: number; w: number; h: number; z: number;
  minimized: boolean; maximized: boolean;
  prevRect?: Rect; snapZone?: SnapZone; payload?: unknown; pinned?: boolean;
  spaceId?: number; groupId?: string;
};

export type ShellState = {
  windows: Record<WinId, WindowState>;
  order: WinId[];
  focused: WinId | null;
  activeSpace: number;
  launcherOpen: boolean; spotlightOpen: boolean; inspectorOpen: boolean;
  notificationCenterOpen: boolean;
};

export type PersistedWindow = Pick<WindowState,
  "id" | "app" | "title" | "x" | "y" | "w" | "h" | "minimized" | "maximized" | "pinned" | "spaceId" | "groupId"
>;
