"use client";

import * as React from "react";
import { NotionDatabase } from "@/features/notion-database";
import type { Database, Page, PropertyValue } from "@/features/notion-shell";

const DB: Database = {
  id: "db-tasks",
  name: "Sprint tasks",
  icon: "📋",
  rowIds: ["t1", "t2", "t3", "t4", "t5"],
  properties: [
    { id: "title",    name: "Title",   type: "text" },
    { id: "status",   name: "Status",  type: "status",
      options: [
        { id: "todo",  name: "Todo",        color: "zinc" },
        { id: "doing", name: "In progress", color: "amber" },
        { id: "done",  name: "Done",        color: "emerald" },
      ] },
    { id: "priority", name: "Priority", type: "select",
      options: [
        { id: "p0", name: "P0", color: "rose" },
        { id: "p1", name: "P1", color: "amber" },
        { id: "p2", name: "P2", color: "sky" },
      ] },
    { id: "tags",     name: "Tags",    type: "multi_select",
      options: [
        { id: "ui",     name: "ui",     color: "violet" },
        { id: "infra",  name: "infra",  color: "sky" },
        { id: "design", name: "design", color: "rose" },
      ] },
    { id: "due",      name: "Due",     type: "date" },
    { id: "blocked",  name: "Blocked", type: "checkbox" },
  ],
  views: [
    { id: "v1", name: "Table", type: "table", filters: [], sorts: [], search: "" },
    { id: "v2", name: "Board", type: "board", groupBy: "status", filters: [], sorts: [], search: "" },
    { id: "v3", name: "List",  type: "list",  filters: [], sorts: [], search: "" },
  ],
  activeViewId: "v1",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const ROWS: Page[] = [
  makeRow("t1", "Wire up provider adapters",   { status: "done",  priority: "p0", tags: ["infra"],            due: { date: "2026-05-18" } }),
  makeRow("t2", "Polish admin-panel chrome",    { status: "done",  priority: "p1", tags: ["ui", "design"],     due: { date: "2026-05-21" } }),
  makeRow("t3", "Audit-log diff tree",          { status: "done",  priority: "p1", tags: ["ui"],               due: { date: "2026-05-21" } }),
  makeRow("t4", "Split notion-database slice",  { status: "doing", priority: "p0", tags: ["infra", "ui"],      due: { date: "2026-05-22" }, blocked: false }),
  makeRow("t5", "Lift editor selection toolbar",{ status: "todo",  priority: "p2", tags: ["ui"],               due: { date: "2026-05-25" }, blocked: true }),
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

/** Minimal interactive preview: real Notion-like database with
 *  table / board / list views. Click ViewTabs to swap views; the
 *  board groups by status, table is the default. All mutations are
 *  no-ops (preview-only) — same component shipped to consumers. */
export default function Page() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-background p-6">
      <NotionDatabase
        db={DB}
        rows={ROWS}
        onPropertyAdd={() => {}}
        onPropertyUpdate={() => {}}
        onPropertyRemove={() => {}}
        onRowAdd={() => {}}
        onRowUpdate={() => {}}
        onRowRemove={() => {}}
        onViewActivate={() => {}}
        onViewAdd={() => {}}
        onViewRemove={() => {}}
        onViewConfigChange={() => {}}
      />
    </main>
  );
}
