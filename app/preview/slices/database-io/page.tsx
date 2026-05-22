"use client";

/** Minimal interactive preview for database-io: combined CSV + JSON
 *  import/export + dynamic template download against an in-memory
 *  notion-database. */

import * as React from "react";
import { DatabaseIOActions } from "@/features/database-io";
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
        { id: "p2", name: "P2", color: "blue" },
      ] },
    { id: "due",      name: "Due",      type: "date" },
  ],
  views: [
    { id: "v1", name: "Table", type: "table", filters: [], sorts: [], search: "" },
  ],
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
  makeRow("t3", "Lift database-io slice",    { status: "doing", priority: "p0", due: { date: "2026-05-22" } }),
];

export default function Page() {
  const [db, setDb] = React.useState<Database>(INITIAL_DB);
  const [rows, setRows] = React.useState<Page[]>(INITIAL_ROWS);

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-background p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">database-io</p>
          <h1 className="text-2xl font-semibold">Import + export + template</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One dropdown — CSV + JSON in both directions. Click
            <span className="ml-1 font-mono">Download template</span> to get a
            CSV or JSON skeleton built from the live column set.
          </p>
        </div>
        <DatabaseIOActions
          db={db}
          rows={rows}
          onImport={(result) => {
            const newProperties = result.newProperties ?? [];
            const drafts = result.rows ?? [];
            const added: Property[] = newProperties.map((n, idx) => ({
              id: `np_${Date.now()}_${idx}`,
              name: n.name,
              type: n.type,
              options: n.options,
            }));
            const nextDb: Database = {
              ...db,
              properties: [...db.properties, ...added],
              updatedAt: Date.now(),
            };
            const nextRows: Page[] = drafts.map((d, idx) => {
              const rid = `imp_${Date.now()}_${idx}`;
              const remapped: Record<string, PropertyValue> = {};
              for (const [k, v] of Object.entries(d.rowProps)) {
                const newProp = added.find((p) => p.id === k || k.startsWith("new:"));
                remapped[newProp?.id ?? k] = v;
              }
              return makeRow(rid, d.title || "Untitled", remapped);
            });
            setDb({ ...nextDb, rowIds: [...nextDb.rowIds, ...nextRows.map((r) => r.id)] });
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
    </main>
  );
}
