"use client";

/** Column header render helper for NotionDatabase. Extracted to keep
 *  the orchestrator file under the 200-LOC audit cap. */

import { ColumnHeaderMenu } from "./ColumnHeaderMenu";
import type {
  CalcKind, DatabaseViewConfig, Property,
} from "../types";

interface Args {
  prop: Property;
  activeView: DatabaseViewConfig;
  onPropertyUpdate?: (propId: string, patch: Partial<Property>) => void;
  onPropertyRemove?: (propId: string) => void;
  onViewConfigChange?: (viewId: string, patch: Partial<DatabaseViewConfig>) => void;
}

export function buildColumnHeader({
  prop, activeView,
  onPropertyUpdate, onPropertyRemove, onViewConfigChange,
}: Args) {
  return (
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
      currentCalc={(activeView.tableCalcs?.[prop.id] ?? "none") as CalcKind}
      onSetCalc={onViewConfigChange && activeView.type === "table"
        ? (kind) => onViewConfigChange(activeView.id, {
            tableCalcs: { ...(activeView.tableCalcs ?? {}), [prop.id]: kind },
          })
        : undefined}
    />
  );
}
