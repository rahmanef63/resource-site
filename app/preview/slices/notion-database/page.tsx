"use client";

import * as React from "react";
import { NotionDatabase } from "@/features/notion-database";
import type { Database, Page, PropertyValue } from "@/features/notion-shell";

import { InstallCTA } from "./InstallCTA";

const DB: Database = {
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
    { id: "owners",   name: "Owners",  type: "person" },
    { id: "attach",   name: "Files",   type: "files" },
    { id: "summary",  name: "Summary", type: "formula", formulaExpression: "concat(upper({{title}}), \" · \", {{status}})" },
    { id: "uid",      name: "ID",      type: "unique_id", uniqueIdPrefix: "TASK" },
    { id: "created",  name: "Created", type: "created_time" },
    { id: "edited",   name: "Edited",  type: "last_edited_time" },
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

const ROWS: Page[] = [
  makeRow("t1", "Wire up provider adapters",   { status: "done",  priority: "p0", tags: ["infra"], due: { date: "2026-05-18" }, start: { date: "2026-05-14" }, end: { date: "2026-05-18" }, lat: 37.7749, lng: -122.4194, owners: ["Rahman"], attach: ["https://example.com/spec.pdf"] }),
  makeRow("t2", "Polish admin-panel chrome",    { status: "done",  priority: "p1", tags: ["ui", "design"], due: { date: "2026-05-21" }, start: { date: "2026-05-19" }, end: { date: "2026-05-21" }, lat: 51.5074, lng: -0.1278, owners: ["Rahman", "Studio"] }),
  makeRow("t3", "Audit-log diff tree",          { status: "done",  priority: "p1", tags: ["ui"], due: { date: "2026-05-21" }, start: { date: "2026-05-20" }, end: { date: "2026-05-21" }, lat: 35.6762, lng: 139.6503, owners: ["Rahman"] }),
  makeRow("t4", "Split notion-database slice",  { status: "doing", priority: "p0", tags: ["infra", "ui"], due: { date: "2026-05-22" }, start: { date: "2026-05-21" }, end: { date: "2026-05-23" }, blocked: false, lat: -6.2088, lng: 106.8456, owners: ["Rahman"], attach: ["https://example.com/diagram.png", "https://example.com/notes.md"] }),
  makeRow("t5", "Lift editor selection toolbar",{ status: "todo",  priority: "p2", tags: ["ui"], due: { date: "2026-05-25" }, start: { date: "2026-05-24" }, end: { date: "2026-05-27" }, blocked: true, lat: 48.8566, lng: 2.3522, owners: [] }),
];

function makeRow(id: string, title: string, props: Record<string, PropertyValue>): Page {
  return {
    id, parentId: null, title, icon: "📌",
    blocks: [], favorite: false, trashed: false,
    createdAt: Date.now(), updatedAt: Date.now(),
    rowOfDatabaseId: "db-tasks",
    rowProps: { title, ...props },
  };
}

/** Minimal interactive preview: real Notion-like database with 11 views.
 *  Form view submit + view activate persist to component state so the
 *  demo can show round-trip behavior without a backend. */
export default function Page() {
  const [db, setDb] = React.useState(DB);
  const [rows, setRows] = React.useState(ROWS);
  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-background p-6">
      <InstallCTA />
      <NotionDatabase
        db={db}
        rows={rows}
        onPropertyAdd={() => {}}
        onPropertyUpdate={() => {}}
        onPropertyRemove={() => {}}
        onRowAdd={() => {}}
        onRowUpdate={() => {}}
        onRowRemove={() => {}}
        onViewActivate={(viewId) => setDb({ ...db, activeViewId: viewId })}
        onViewAdd={() => {}}
        onViewRemove={() => {}}
        onViewConfigChange={(viewId, patch) => setDb({
          ...db,
          views: db.views.map((v) => (v.id === viewId ? { ...v, ...patch } : v)),
        })}
        onRowCreate={({ title, rowProps }) => {
          const id = `f_${Date.now()}`;
          const next = makeRow(id, title, rowProps);
          setRows([...rows, next]);
          setDb({ ...db, rowIds: [...db.rowIds, id] });
        }}
      />
    </main>
  );
}
