"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { NotionDatabase } from "@/features/notion-database";
import type {
  Database,
  DatabaseViewConfig,
  DbView,
  Page,
  Property,
  PropertyType,
  PropertyValue,
} from "@/features/notion-shell";
import { Button } from "@/components/ui/button";

import { InstallCTA } from "./InstallCTA";
import { INITIAL_DB, INITIAL_ROWS, makeRow, newId } from "./previewState";

/** Fully interactive preview: every callback mutates local state so the
 *  demo reflects real Notion-like behavior (no backend required). */
export default function Page() {
  const [db, setDb] = React.useState<Database>(INITIAL_DB);
  const [rows, setRows] = React.useState<Page[]>(INITIAL_ROWS);

  const onPropertyAdd = (type: PropertyType) => {
    const prop: Property = { id: newId(), name: `New ${type}`, type };
    setDb((d) => ({ ...d, properties: [...d.properties, prop], updatedAt: Date.now() }));
  };
  const onPropertyUpdate = (propId: string, patch: Partial<Property>) => {
    setDb((d) => ({
      ...d,
      properties: d.properties.map((p) => (p.id === propId ? { ...p, ...patch } : p)),
      updatedAt: Date.now(),
    }));
  };
  const onPropertyRemove = (propId: string) => {
    setDb((d) => ({
      ...d,
      properties: d.properties.filter((p) => p.id !== propId),
      updatedAt: Date.now(),
    }));
  };

  const onRowAdd = () => {
    const id = newId();
    setRows((rs) => [...rs, makeRow(id, "", {})]);
    setDb((d) => ({ ...d, rowIds: [...d.rowIds, id], updatedAt: Date.now() }));
  };
  const onRowUpdate = (rowId: string, propId: string, value: PropertyValue) => {
    setRows((rs) => rs.map((r) => {
      if (r.id !== rowId) return r;
      const nextProps = { ...(r.rowProps ?? {}), [propId]: value };
      const nextTitle = propId === "title" && typeof value === "string" ? value : r.title;
      return { ...r, title: nextTitle, rowProps: nextProps, updatedAt: Date.now() };
    }));
  };
  const onRowRemove = (rowId: string) => {
    setRows((rs) => rs.filter((r) => r.id !== rowId));
    setDb((d) => ({ ...d, rowIds: d.rowIds.filter((id) => id !== rowId), updatedAt: Date.now() }));
  };

  const onViewActivate = (viewId: string) =>
    setDb((d) => ({ ...d, activeViewId: viewId }));
  const onViewAdd = (type: DbView) => {
    const view: DatabaseViewConfig = {
      id: newId(),
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      filters: [],
      sorts: [],
      search: "",
    };
    setDb((d) => ({ ...d, views: [...d.views, view], activeViewId: view.id, updatedAt: Date.now() }));
  };
  const onViewRemove = (viewId: string) => {
    setDb((d) => {
      const views = d.views.filter((v) => v.id !== viewId);
      const activeViewId = d.activeViewId === viewId ? (views[0]?.id ?? d.activeViewId) : d.activeViewId;
      return { ...d, views, activeViewId, updatedAt: Date.now() };
    });
  };
  const onViewConfigChange = (viewId: string, patch: Partial<DatabaseViewConfig>) =>
    setDb((d) => ({
      ...d,
      views: d.views.map((v) => (v.id === viewId ? { ...v, ...patch } : v)),
      updatedAt: Date.now(),
    }));

  const onRowCreate = ({ title, rowProps }: { title: string; rowProps: Record<string, PropertyValue> }) => {
    const id = newId();
    setRows((rs) => [...rs, makeRow(id, title, rowProps)]);
    setDb((d) => ({ ...d, rowIds: [...d.rowIds, id], updatedAt: Date.now() }));
  };

  const handleReset = () => {
    setDb(INITIAL_DB);
    setRows(INITIAL_ROWS);
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-background p-6">
      <InstallCTA />
      <div className="mb-3 flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset demo data
        </Button>
      </div>
      <NotionDatabase
        db={db}
        rows={rows}
        onPropertyAdd={onPropertyAdd}
        onPropertyUpdate={onPropertyUpdate}
        onPropertyRemove={onPropertyRemove}
        onRowAdd={onRowAdd}
        onRowUpdate={onRowUpdate}
        onRowRemove={onRowRemove}
        onViewActivate={onViewActivate}
        onViewAdd={onViewAdd}
        onViewRemove={onViewRemove}
        onViewConfigChange={onViewConfigChange}
        onRowCreate={onRowCreate}
      />
    </main>
  );
}
