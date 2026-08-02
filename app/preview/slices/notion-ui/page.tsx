"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import {
  NotionDatabase,
  DatabaseIOActions,
} from "@/features/notion-ui";
import type {
  Database,
  DatabaseViewConfig,
  DbView,
  Page,
  Property,
  PropertyType,
  PropertyValue,
  SelectOption,
} from "@/features/notion-ui";
import { Button } from "@/components/ui/button";

import {
  INITIAL_DB,
  INITIAL_ROWS,
  makeRow,
  newId,
  useLocalStorageState,
  PREVIEW_STORAGE_KEYS,
  userLookup,
} from "./previewState";
import {
  reorderProperty,
  insertPropertyNear,
  duplicatePropertyInDb,
  copyPropertyValues,
} from "./previewColumnOps";

/** Fully interactive preview with localStorage persistence. Every
 *  callback mutates state; useLocalStorageState rehydrates on mount
 *  and writes on every change. Includes DatabaseIOActions toolbar so
 *  CSV + JSON import/export is demoable end-to-end. */
export default function Page() {
  const [db, setDb] = useLocalStorageState<Database>(PREVIEW_STORAGE_KEYS.db, INITIAL_DB);
  const [rows, setRows] = useLocalStorageState<Page[]>(PREVIEW_STORAGE_KEYS.rows, INITIAL_ROWS);

  const onPropertyAdd = (type: PropertyType) => {
    const prop: Property = { id: newId(), name: `New ${type}`, type };
    setDb((d) => ({ ...d, properties: [...d.properties, prop], updatedAt: Date.now() }));
  };
  const onPropertyUpdate = (propId: string, patch: Partial<Property>) =>
    setDb((d) => ({
      ...d,
      properties: d.properties.map((p) => (p.id === propId ? { ...p, ...patch } : p)),
      updatedAt: Date.now(),
    }));
  const onPropertyRemove = (propId: string) =>
    setDb((d) => ({
      ...d,
      properties: d.properties.filter((p) => p.id !== propId),
      updatedAt: Date.now(),
    }));
  const onPropertyDuplicate = (propId: string) => {
    const copyId = newId();
    setDb((d) => duplicatePropertyInDb(d, propId, copyId));
    setRows((rs) => copyPropertyValues(rs, propId, copyId));
  };
  const onPropertyInsert = (propId: string, offset: -1 | 1) =>
    setDb((d) => insertPropertyNear(d, propId, offset, newId()));
  const onPropertyMove = (propId: string, offset: -1 | 1) =>
    setDb((d) => reorderProperty(d, propId, offset));

  const onRowAdd = () => {
    const id = newId();
    setRows((rs) => [...rs, makeRow(id, "", {})]);
    setDb((d) => ({ ...d, rowIds: [...d.rowIds, id], updatedAt: Date.now() }));
  };
  const onRowUpdate = (rowId: string, propId: string, value: PropertyValue) =>
    setRows((rs) => rs.map((r) => {
      if (r.id !== rowId) return r;
      const nextProps = { ...(r.rowProps ?? {}), [propId]: value };
      const nextTitle = propId === "title" && typeof value === "string" ? value : r.title;
      return { ...r, title: nextTitle, rowProps: nextProps, updatedAt: Date.now() };
    }));
  const onRowRemove = (rowId: string) => {
    setRows((rs) => rs.filter((r) => r.id !== rowId));
    setDb((d) => ({ ...d, rowIds: d.rowIds.filter((id) => id !== rowId), updatedAt: Date.now() }));
  };

  const onViewActivate = (viewId: string) => setDb((d) => ({ ...d, activeViewId: viewId }));
  const onViewAdd = (type: DbView) => {
    const view: DatabaseViewConfig = {
      id: newId(),
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type, filters: [], sorts: [], search: "",
    };
    setDb((d) => ({ ...d, views: [...d.views, view], activeViewId: view.id, updatedAt: Date.now() }));
  };
  const onViewRemove = (viewId: string) =>
    setDb((d) => {
      const views = d.views.filter((v) => v.id !== viewId);
      const activeViewId = d.activeViewId === viewId ? (views[0]?.id ?? d.activeViewId) : d.activeViewId;
      return { ...d, views, activeViewId, updatedAt: Date.now() };
    });
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

  /** CSV / JSON import callback — applies new properties + new rows
   *  via the same callbacks the user would dispatch manually. */
  const onImport = async ({
    newProperties, rows: importedRows,
  }: {
    newProperties: Array<{ tempId: string; type: PropertyType; name: string; options?: SelectOption[] }>;
    rows: Array<{ title: string; rowProps: Record<string, PropertyValue> }>;
  }) => {
    const tempToReal: Record<string, string> = {};
    setDb((d) => {
      const newProps: Property[] = newProperties.map((np) => {
        const id = newId();
        tempToReal[np.tempId] = id;
        return { id, name: np.name, type: np.type, options: np.options };
      });
      return { ...d, properties: [...d.properties, ...newProps], updatedAt: Date.now() };
    });
    const newIds: string[] = [];
    setRows((rs) => {
      const next = [...rs];
      for (const r of importedRows) {
        const rowId = newId();
        newIds.push(rowId);
        const remappedProps: Record<string, PropertyValue> = {};
        for (const [k, v] of Object.entries(r.rowProps)) {
          remappedProps[tempToReal[k] ?? k] = v;
        }
        next.push(makeRow(rowId, r.title, remappedProps));
      }
      return next;
    });
    setDb((d) => ({ ...d, rowIds: [...d.rowIds, ...newIds], updatedAt: Date.now() }));
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(PREVIEW_STORAGE_KEYS.db);
      window.localStorage.removeItem(PREVIEW_STORAGE_KEYS.rows);
    }
    setDb(INITIAL_DB);
    setRows(INITIAL_ROWS);
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-background p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <DatabaseIOActions db={db} rows={rows} onImport={onImport} />
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
        onPropertyDuplicate={onPropertyDuplicate}
        onPropertyInsert={onPropertyInsert}
        onPropertyMove={onPropertyMove}
        onRowAdd={onRowAdd}
        onRowUpdate={onRowUpdate}
        onRowRemove={onRowRemove}
        onViewActivate={onViewActivate}
        onViewAdd={onViewAdd}
        onViewRemove={onViewRemove}
        onViewConfigChange={onViewConfigChange}
        onRowCreate={onRowCreate}
        userLookup={userLookup}
      />
    </main>
  );
}
