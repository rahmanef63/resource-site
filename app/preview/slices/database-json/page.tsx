"use client";

/** Minimal interactive preview: JSON Export + Import against an in-memory
 *  notion-database. Click "JSON" → Export downloads tasks.json, Import
 *  opens a file picker + preview; submitted result persists to component
 *  state for the session (refresh clears). Also shows JSON wire payload
 *  inline so users can inspect format. */

import * as React from "react";
import { JsonActions, exportDatabase } from "@/features/database-json";
import { NotionDatabase } from "@/features/notion-database";
import type {
  Database, Page, Property, PropertyValue,
} from "@/features/notion-shell";

const INITIAL_DB: Database = {
  id: "db-tasks",
  name: "Sprint tasks",
  icon: "📋",
  rowIds: ["t1", "t2", "t3"],
  properties: [
    { id: "title",    name: "Title",    type: "text" },
    { id: "status",   name: "Status",   type: "status",
      options: [
        { id: "todo",  name: "Todo",        color: "gray" },
        { id: "doing", name: "In progress", color: "yellow" },
        { id: "done",  name: "Done",        color: "green" },
      ] },
    { id: "priority", name: "Priority", type: "select",
      options: [
        { id: "p0", name: "P0", color: "red" },
        { id: "p1", name: "P1", color: "yellow" },
      ] },
    { id: "due",      name: "Due",      type: "date" },
  ],
  views: [{ id: "v1", name: "Table", type: "table", filters: [], sorts: [], search: "" }],
  activeViewId: "v1",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function makeRow(id: string, title: string, props: Record<string, PropertyValue>): Page {
  return {
    id, parentId: null, title, icon: "📌",
    blocks: [], favorite: false, trashed: false,
    createdAt: Date.now(), updatedAt: Date.now(),
    rowOfDatabaseId: "db-tasks",
    rowProps: { title, ...props },
  };
}

const INITIAL_ROWS: Page[] = [
  makeRow("t1", "Wire up provider adapters", { status: "done",  priority: "p0", due: { date: "2026-05-18" } }),
  makeRow("t2", "Polish admin-panel chrome", { status: "done",  priority: "p1", due: { date: "2026-05-21" } }),
  makeRow("t3", "Lift database-json slice",  { status: "doing", priority: "p0", due: { date: "2026-05-22" } }),
];

export default function Page() {
  const [db, setDb] = React.useState<Database>(INITIAL_DB);
  const [rows, setRows] = React.useState<Page[]>(INITIAL_ROWS);
  const wire = React.useMemo(() => exportDatabase(db, rows), [db, rows]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-4 bg-background p-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">database-json</p>
          <h1 className="text-2xl font-semibold">Import + export (wire v1)</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Click <span className="font-mono">JSON</span> → Export to download the table.
            Re-import the downloaded file to see schema diff + row remap in action.
          </p>
        </div>
        <JsonActions
          db={db}
          rows={rows}
          onImport={({ newProperties, rows: drafts }) => {
            const added: Property[] = newProperties.map((n, idx) => ({
              id: `np_${Date.now()}_${idx}`,
              name: n.name,
              type: n.type,
              options: n.options,
            }));
            const nextRows: Page[] = drafts.map((d, idx) => {
              const rid = `imp_${Date.now()}_${idx}`;
              return makeRow(rid, d.title || "Untitled", d.rowProps);
            });
            setDb({
              ...db,
              properties: [...db.properties, ...added],
              rowIds: [...db.rowIds, ...nextRows.map((r) => r.id)],
              updatedAt: Date.now(),
            });
            setRows([...rows, ...nextRows]);
          }}
        />
      </header>
      <NotionDatabase
        db={db}
        rows={rows}
        onPropertyAdd={() => {}}
        onPropertyUpdate={() => {}}
        onPropertyRemove={() => {}}
        onRowAdd={() => {}}
        onRowUpdate={() => {}}
        onRowRemove={() => {}}
        onViewActivate={() => {}}
      />
      <details className="rounded-lg border border-border bg-card p-3">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
          Wire format v1 — current export
        </summary>
        <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-muted/40 p-3 text-[10px] leading-relaxed">
          {wire}
        </pre>
      </details>
    </main>
  );
}
