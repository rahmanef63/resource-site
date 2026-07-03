import { useCallback, useEffect, useState } from "react";
import type { Database, Page, PropertyValue } from "@/features/notion-ui";

export const newId = (): string =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** Namespaced storage keys for the preview. Versioned so a future
 *  schema change can bump and invalidate stale demo data without
 *  user intervention. */
export const PREVIEW_STORAGE_KEYS = {
  db:   "silong-preview:notion-database:v1:db",
  rows: "silong-preview:notion-database:v1:rows",
} as const;

/** Drop-in useState replacement that hydrates from + persists to
 *  localStorage. SSR-safe (returns initial on server, reads on mount).
 *  Writes on every state change. Used by the preview so refreshing
 *  the page keeps the demo state. */
export function useLocalStorageState<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setState(JSON.parse(raw) as T);
    } catch {
      // Corrupt or unavailable — fall back to initial.
    }
    setHydrated(true);
  }, [key]);

  // Persist on change, but only after hydration to avoid stomping
  // user state with the initial value during the first render.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Quota exceeded / private mode — silently ignore.
    }
  }, [hydrated, key, state]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setState((prev) => (typeof next === "function" ? (next as (p: T) => T)(prev) : next));
  }, []);

  return [state, set];
}

/** Demo user directory — wired via NotionDatabase userLookup prop so
 *  person / created_by / last_edited_by cells render real names + icons. */
export const DEMO_USERS = [
  { id: "u-rahman", name: "Rahman", icon: "🧑" },
  { id: "u-studio", name: "Studio", icon: "🎨" },
  { id: "u-alex",   name: "Alex",   icon: "🦊" },
] as const;

export const userLookup = (id: string) =>
  DEMO_USERS.find((u) => u.id === id || u.name === id) ?? null;

export function makeRow(
  id: string,
  title: string,
  props: Record<string, PropertyValue>,
  attribution?: { createdBy?: string; lastEditedBy?: string },
): Page {
  return {
    id, parentId: null, title, icon: "📌",
    blocks: [], favorite: false, trashed: false,
    createdAt: Date.now(), updatedAt: Date.now(),
    createdBy: attribution?.createdBy ?? "u-rahman",
    lastEditedBy: attribution?.lastEditedBy ?? "u-rahman",
    rowOfDatabaseId: "db-tasks",
    rowProps: { title, ...props },
  };
}

export const INITIAL_DB: Database = {
  id: "db-tasks",
  name: "Sprint tasks",
  icon: "📋",
  rowIds: ["t1", "t2", "t3", "t4", "t5"],
  properties: [
    { id: "title",    name: "Title",   type: "text" },
    { id: "status",   name: "Status",  type: "status",
      options: [
        { id: "todo",  name: "Todo",        color: "gray" },
        { id: "doing", name: "In progress", color: "yellow" },
        { id: "done",  name: "Done",        color: "green" },
      ] },
    { id: "priority", name: "Priority", type: "select",
      options: [
        { id: "p0", name: "P0", color: "red" },
        { id: "p1", name: "P1", color: "yellow" },
        { id: "p2", name: "P2", color: "blue" },
      ] },
    { id: "tags",     name: "Tags",    type: "multi_select",
      options: [
        { id: "ui",     name: "ui",     color: "purple" },
        { id: "infra",  name: "infra",  color: "blue" },
        { id: "design", name: "design", color: "red" },
      ] },
    { id: "start",    name: "Start",   type: "date" },
    { id: "end",      name: "End",     type: "date" },
    { id: "due",      name: "Due",     type: "date" },
    { id: "blocked",  name: "Blocked", type: "checkbox" },
    { id: "lat",      name: "Lat",     type: "number" },
    { id: "lng",      name: "Lng",     type: "number" },
    { id: "budget",   name: "Budget",  type: "number", numberFormat: "currency", numberDecimals: 0 },
    { id: "progress", name: "Progress",type: "number", numberFormat: "percent",  numberDecimals: 0 },
    { id: "spec",     name: "Spec",    type: "url" },
    { id: "lead",     name: "Lead",    type: "email" },
    { id: "contact",  name: "Contact", type: "phone" },
    { id: "owners",   name: "Owners",  type: "person" },
    { id: "attach",   name: "Files",   type: "files" },
    { id: "summary",  name: "Summary", type: "formula", formulaExpression: "concat(upper({{title}}), \" · \", {{status}})" },
    { id: "uid",      name: "ID",      type: "unique_id", uniqueIdPrefix: "TASK" },
    { id: "created",  name: "Created", type: "created_time" },
    { id: "edited",   name: "Edited",  type: "last_edited_time" },
    { id: "createdBy", name: "Author", type: "created_by" },
    { id: "editedBy",  name: "Editor", type: "last_edited_by" },
  ],
  views: [
    { id: "v1", name: "Table", type: "table", filters: [], sorts: [], search: "" },
    { id: "v2", name: "Board", type: "board", groupBy: "status", filters: [], sorts: [], search: "" },
    { id: "v3", name: "List",  type: "list",  filters: [], sorts: [], search: "" },
    { id: "v4", name: "Chart", type: "chart", filters: [], sorts: [], search: "",
      chartKind: "bar", chartXProp: "status", chartAggregate: "count", chartShowLegend: false },
    { id: "v5", name: "Dashboard", type: "dashboard", filters: [], sorts: [], search: "" },
    { id: "v6", name: "Map",   type: "map",   filters: [], sorts: [], search: "",
      mapLatProp: "lat", mapLngProp: "lng", mapPinColorProp: "status" },
    { id: "v7", name: "Timeline", type: "timeline", filters: [], sorts: [], search: "",
      timelineStartProp: "start", timelineEndProp: "end", timelineColorByProp: "status",
      timelineZoom: "month" },
    { id: "v8", name: "Form", type: "form", filters: [], sorts: [], search: "",
      formTitle: "Submit a task",
      formDescription: "Click Submit to add a row to the database below.",
      formRequiredProps: ["status", "priority"],
      formShownProps: ["status", "priority", "tags", "start", "end", "due", "owners"],
      formSuccessMessage: "Row added!" },
  ],
  activeViewId: "v1",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const INITIAL_ROWS: Page[] = [
  makeRow("t1", "Wire up provider adapters",   { status: "done",  priority: "p0", tags: ["infra"], due: { date: "2026-05-18" }, start: { date: "2026-05-14" }, end: { date: "2026-05-18" }, lat: 37.7749, lng: -122.4194, budget: 4500, progress: 1, spec: "https://docs.silong.dev/adapters", lead: "rahman@example.com", contact: "+62 812 0000 0001", owners: ["u-rahman"], attach: ["https://example.com/spec.pdf"] }, { createdBy: "u-rahman", lastEditedBy: "u-rahman" }),
  makeRow("t2", "Polish admin-panel chrome",    { status: "done",  priority: "p1", tags: ["ui", "design"], due: { date: "2026-05-21" }, start: { date: "2026-05-19" }, end: { date: "2026-05-21" }, lat: 51.5074, lng: -0.1278, budget: 1800, progress: 0.95, spec: "https://figma.com/admin-panel", lead: "studio@example.com", contact: "+44 20 7946 0001", owners: ["u-rahman", "u-studio"] }, { createdBy: "u-studio", lastEditedBy: "u-rahman" }),
  makeRow("t3", "Audit-log diff tree",          { status: "done",  priority: "p1", tags: ["ui"], due: { date: "2026-05-21" }, start: { date: "2026-05-20" }, end: { date: "2026-05-21" }, lat: 35.6762, lng: 139.6503, budget: 1200, progress: 1, owners: ["u-alex"] }, { createdBy: "u-alex", lastEditedBy: "u-alex" }),
  makeRow("t4", "Split notion-database slice",  { status: "doing", priority: "p0", tags: ["infra", "ui"], due: { date: "2026-05-22" }, start: { date: "2026-05-21" }, end: { date: "2026-05-23" }, blocked: false, lat: -6.2088, lng: 106.8456, budget: 3000, progress: 0.6, spec: "https://github.com/rahmanef63/open-silong", owners: ["u-rahman"], attach: ["https://example.com/diagram.png", "https://example.com/notes.md"] }, { createdBy: "u-rahman", lastEditedBy: "u-rahman" }),
  makeRow("t5", "Lift editor selection toolbar",{ status: "todo",  priority: "p2", tags: ["ui"], due: { date: "2026-05-25" }, start: { date: "2026-05-24" }, end: { date: "2026-05-27" }, blocked: true, lat: 48.8566, lng: 2.3522, owners: [] }),
];
