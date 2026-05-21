"use client";

/** <NotionDatabase /> — full database surface with view tabs, view
 *  options (sort / filter / search), per-column header menu, and 6
 *  built-in views (table / board / list / gallery / calendar / feed).
 *
 *  Pure / callback-based — hand it `db` + `rows` + handlers; it emits
 *  CRUD intents only. View routing dispatches via VIEW_REGISTRY
 *  (override at the host to plug custom views). */

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "rahman-shared/lib/utils";
import { renderPropertyCell } from "./property-cells";
import { ViewTabs } from "./ViewTabs";
import { ViewOptions } from "./ViewOptions";
import { ColumnHeaderMenu } from "./ColumnHeaderMenu";
import { VIEW_REGISTRY, type ViewRegistry } from "./views";
import { applyView } from "../lib/viewData";
import type {
  Database, DatabaseViewConfig, DbView, Page, Property, PropertyType, PropertyValue,
} from "../types";

const DEFAULT_NEW_PROP_TYPE: PropertyType = "text";

export interface NotionDatabaseProps {
  db: Database;
  rows: Page[];
  // Property CRUD
  onPropertyAdd?: (type: PropertyType) => void;
  onPropertyUpdate?: (propId: string, patch: Partial<Property>) => void;
  onPropertyRemove?: (propId: string) => void;
  // Row CRUD
  onRowAdd?: () => void;
  onRowUpdate?: (rowId: string, propId: string, value: PropertyValue) => void;
  onRowRemove?: (rowId: string) => void;
  // View CRUD (optional — when omitted the view tabs are read-only)
  onViewActivate?: (viewId: string) => void;
  onViewAdd?: (type: DbView) => void;
  onViewRemove?: (viewId: string) => void;
  onViewConfigChange?: (viewId: string, patch: Partial<DatabaseViewConfig>) => void;
  /** Override / extend the view registry (e.g. add timeline / chart). */
  viewRegistry?: ViewRegistry;
  /** Optional row-open callback — surfaced by Chart / Dashboard / Map /
   *  Timeline views when a row is clicked. Host can open a detail sheet. */
  onOpenRow?: (rowId: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function NotionDatabase({
  db, rows,
  onPropertyAdd, onPropertyUpdate, onPropertyRemove,
  onRowAdd, onRowUpdate, onRowRemove,
  onViewActivate, onViewAdd, onViewRemove, onViewConfigChange,
  viewRegistry, onOpenRow,
  readOnly, className,
}: NotionDatabaseProps) {
  const activeView = db.views.find((v) => v.id === db.activeViewId) ?? db.views[0];
  if (!activeView) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground", className)}>
        {db.name} has no views configured yet.
      </div>
    );
  }

  const visibleRows = applyView(rows, db, activeView);
  const registry = { ...VIEW_REGISTRY, ...(viewRegistry ?? {}) };
  const View = registry[activeView.type] ?? registry.table!;

  const renderCell = (prop: Property, row: Page) =>
    renderPropertyCell({
      prop,
      value: (row.rowProps?.[prop.id] as PropertyValue) ?? null,
      readOnly: !!readOnly || !onRowUpdate,
      onChange: onRowUpdate ? (v) => onRowUpdate(row.id, prop.id, v) : undefined,
    });

  const renderColumnHeader = (prop: Property) => (
    <ColumnHeaderMenu
      prop={prop}
      onRename={onPropertyUpdate ? () => {
        const next = window.prompt("Rename property", prop.name);
        if (next && next.trim()) onPropertyUpdate(prop.id, { name: next.trim() });
      } : undefined}
      onTypeChange={onPropertyUpdate ? (type) => onPropertyUpdate(prop.id, { type }) : undefined}
      onHide={onPropertyUpdate ? () => onPropertyUpdate(prop.id, { hidden: true }) : undefined}
      onDelete={onPropertyRemove ? () => onPropertyRemove(prop.id) : undefined}
      onSortAsc={onViewConfigChange ? () => onViewConfigChange(activeView.id, { sorts: [{ propertyId: prop.id, direction: "asc" }] }) : undefined}
      onSortDesc={onViewConfigChange ? () => onViewConfigChange(activeView.id, { sorts: [{ propertyId: prop.id, direction: "desc" }] }) : undefined}
    />
  );

  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold">{db.name}</h3>
        <span className="text-[10px] text-muted-foreground">
          {visibleRows.length} / {rows.length} row{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      <ViewTabs
        views={db.views}
        activeViewId={activeView.id}
        onActivate={onViewActivate ?? (() => {})}
        onAdd={onViewAdd}
        onRemove={onViewRemove}
      />
      {onViewConfigChange && (
        <ViewOptions
          db={db}
          view={activeView}
          onChange={(patch) => onViewConfigChange(activeView.id, patch)}
        />
      )}
      <View
        db={db}
        view={activeView}
        rows={visibleRows}
        readOnly={readOnly}
        onRowUpdate={onRowUpdate}
        onRowRemove={onRowRemove}
        onRowAdd={onRowAdd}
        renderCell={renderCell}
        renderColumnHeader={renderColumnHeader}
        onViewConfigChange={onViewConfigChange ? (patch) => onViewConfigChange(activeView.id, patch) : undefined}
        onOpenRow={onOpenRow}
      />
      {!readOnly && onPropertyAdd && (
        <div className="flex items-center gap-2 border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPropertyAdd(DEFAULT_NEW_PROP_TYPE)}
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
          >
            <Plus className="h-3 w-3" /> Add property
          </Button>
          {onRowAdd && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRowAdd}
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            >
              <Plus className="h-3 w-3" /> Add row
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
