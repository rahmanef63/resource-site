"use client";

/**
 * Variant preview (VP wave) — rr-internal, stripped on `rr add`.
 * Subsystem slice → scenario presets (table / board / list / chart), not a
 * full prop matrix (altitude rule). Compact seed; row edits persist via
 * createDemoStore. The full interactive surface lives at
 * /preview/slices/notion-database.
 */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { NotionDatabase } from "./components/NotionDatabase";
import type { Database, Page, PropertyValue } from "./types";

const now = () => Date.now();

const DB: Database = {
  id: "db-demo",
  name: "Sprint tasks",
  icon: "📋",
  rowIds: ["t1", "t2", "t3", "t4"],
  properties: [
    { id: "title", name: "Title", type: "text" },
    {
      id: "status", name: "Status", type: "status",
      options: [
        { id: "todo", name: "Todo", color: "gray" },
        { id: "doing", name: "In progress", color: "yellow" },
        { id: "done", name: "Done", color: "green" },
      ],
    },
    {
      id: "priority", name: "Priority", type: "select",
      options: [
        { id: "p0", name: "P0", color: "red" },
        { id: "p1", name: "P1", color: "yellow" },
        { id: "p2", name: "P2", color: "blue" },
      ],
    },
    { id: "due", name: "Due", type: "date" },
  ],
  views: [
    { id: "table", name: "Table", type: "table", filters: [], sorts: [], search: "" },
    { id: "board", name: "Board", type: "board", groupBy: "status", filters: [], sorts: [], search: "" },
    { id: "list", name: "List", type: "list", filters: [], sorts: [], search: "" },
    {
      id: "chart", name: "Chart", type: "chart", filters: [], sorts: [], search: "",
      chartKind: "bar", chartXProp: "status", chartAggregate: "count", chartShowLegend: false,
    },
  ],
  activeViewId: "table",
  createdAt: now(),
  updatedAt: now(),
};

const row = (id: string, title: string, props: Record<string, PropertyValue>): Page => ({
  id, parentId: null, title, icon: "📌",
  blocks: [], favorite: false, trashed: false,
  createdAt: now(), updatedAt: now(),
  rowOfDatabaseId: "db-demo",
  rowProps: { title, ...props },
});

const ROWS: Page[] = [
  row("t1", "Wire adapters", { status: "done", priority: "p0", due: { date: "2026-06-02" } }),
  row("t2", "Polish chrome", { status: "doing", priority: "p1", due: { date: "2026-06-08" } }),
  row("t3", "Audit diff tree", { status: "doing", priority: "p2", due: { date: "2026-06-10" } }),
  row("t4", "Lift toolbar", { status: "todo", priority: "p1", due: { date: "2026-06-14" } }),
];

const { useDemoStore } = createDemoStore({
  slug: "notion-database",
  seed: { rows: ROWS },
});

const preview: SlicePreviewModule = {
  NotionDatabase: ({ variant }) => {
    const [state, setState, { ready }] = useDemoStore();
    const scenario = variant.scenario ?? "table";
    if (!ready) return null;
    return (
      <div className="p-2">
        <NotionDatabase
          db={{ ...DB, activeViewId: scenario }}
          rows={state.rows}
          onRowUpdate={(rowId, propId, value) =>
            setState((s) => ({
              rows: s.rows.map((r) =>
                r.id === rowId
                  ? { ...r, rowProps: { ...r.rowProps, [propId]: value }, updatedAt: now() }
                  : r,
              ),
            }))
          }
        />
      </div>
    );
  },
};

export default preview;
