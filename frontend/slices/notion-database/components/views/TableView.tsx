"use client";

/** TableView — Notion-canonical table layout. Pre-filtered rows in;
 *  cells delegated to host via renderCell. Header optionally wrapped by
 *  renderColumnHeader (typically ColumnHeaderMenu). Row hover reveals
 *  the RowActionsMenu (Open / Duplicate / Delete). */

import { useMemo } from "react";
import { RowActionsMenu } from "../RowActionsMenu";
import { CalcFooter } from "./CalcFooter";
import type { ViewProps } from "./types";

export function TableView({
  db, view, rows, readOnly,
  onRowRemove, onOpenRow, onRowDuplicate,
  renderCell, renderColumnHeader,
}: ViewProps) {
  const visibleProps = useMemo(() => db.properties.filter((p) => !p.hidden), [db.properties]);
  const hasRowActions = !readOnly && (!!onRowRemove || !!onOpenRow || !!onRowDuplicate);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
          <tr>
            {visibleProps.map((p) => (
              <th key={p.id} className="px-3 py-1.5 font-normal">
                {renderColumnHeader ? renderColumnHeader(p) : (
                  <span className="truncate">{p.name}</span>
                )}
              </th>
            ))}
            {hasRowActions && <th aria-hidden className="w-8" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="group/row border-b border-border/60 hover:bg-accent/30">
              {visibleProps.map((p) => (
                <td key={p.id} className="px-3 py-1.5">{renderCell(p, r)}</td>
              ))}
              {hasRowActions && (
                <td className="px-1">
                  <span className="inline-flex opacity-0 transition group-hover/row:opacity-100">
                    <RowActionsMenu
                      onOpen={onOpenRow ? () => onOpenRow(r.id) : undefined}
                      onDuplicate={onRowDuplicate ? () => onRowDuplicate(r.id) : undefined}
                      onRemove={onRowRemove ? () => onRowRemove(r.id) : undefined}
                    />
                  </span>
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={visibleProps.length + (hasRowActions ? 1 : 0)} className="px-3 py-4 text-center text-xs italic text-muted-foreground">
                No rows match
              </td>
            </tr>
          )}
        </tbody>
        <CalcFooter view={view} rows={rows} visibleProps={visibleProps} hasRowActions={hasRowActions} />
      </table>
    </div>
  );
}
