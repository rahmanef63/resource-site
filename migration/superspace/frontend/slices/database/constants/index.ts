import type { DatabaseView, DatabaseViewType } from "../types";

export const DATABASE_VIEW_ORDER = [
  "table",
  "gantt",
  "calendar",
  "list",
  "kanban",
] as const satisfies ReadonlyArray<string>;

export const DB_VIEW_TYPE_TO_APP: Record<DatabaseView["type"], DatabaseViewType> = {
  table: "table",
  board: "kanban",
  calendar: "calendar",
  gallery: "table",
  list: "list",
  timeline: "gantt",
};

export const APP_VIEW_TYPE_TO_DB: Record<DatabaseViewType, DatabaseView["type"]> = {
  table: "table",
  gantt: "timeline",
  calendar: "calendar",
  list: "list",
  kanban: "board",
};

export const STATUS_COLOR_FALLBACKS = [
  "bg-blue-100 text-blue-900",
  "bg-green-100 text-green-900",
  "bg-purple-100 text-purple-900",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-900",
  "bg-sky-100 text-sky-900",
  "bg-teal-100 text-teal-900",
] as const;

export const DEFAULT_MARKER_CLASSES = [
  "bg-blue-100 text-blue-900",
  "bg-emerald-100 text-emerald-900",
  "bg-violet-100 text-violet-900",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-900",
] as const;
