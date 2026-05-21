"use client";

/** TableView — Notion-canonical table layout. Pre-filtered rows in;
 *  cells delegated to host via renderCell. Header optionally wrapped by
 *  renderColumnHeader (typically ColumnHeaderMenu). */

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ViewProps } from "./types";

export function TableView({
  db, rows, readOnly, onRowUpdate: _onRowUpdate, onRowRemove,
  renderCell, renderColumnHeader,
}: ViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
          <tr>
            {db.properties.filter((p) => !p.hidden).map((p) => (
              <th key={p.id} className="px-3 py-1.5 font-normal">
                {renderColumnHeader ? renderColumnHeader(p) : (
                  <span className="truncate">{p.name}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="group/row border-b border-border/60 hover:bg-accent/30">
              {db.properties.filter((p) => !p.hidden).map((p) => (
                <td key={p.id} className="px-3 py-1.5">{renderCell(p, r)}</td>
              ))}
              {!readOnly && onRowRemove && (
                <td className="px-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRowRemove(r.id)}
                    className="h-5 w-5 text-muted-foreground/40 opacity-0 group-hover/row:opacity-100 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={db.properties.length + 1} className="px-3 py-4 text-center text-xs italic text-muted-foreground">
                No rows match
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
