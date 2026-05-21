"use client";

/** ListView — compact one-row-per-page layout. Shows title + first
 *  visible property cells inline. Use when density matters more than
 *  per-column comparison. */

import type { ViewProps } from "./types";

export function ListView({ db, rows, renderCell }: ViewProps) {
  const visible = db.properties.filter((p) => !p.hidden);
  return (
    <div className="divide-y divide-border">
      {rows.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3 px-3 py-2 hover:bg-accent/30"
        >
          <span className="w-48 shrink-0 truncate text-sm font-medium">
            {r.title || "Untitled"}
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-3 text-xs">
            {visible.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-1">
                <span className="text-muted-foreground">{p.name}:</span>
                <span className="max-w-[16ch] truncate">{renderCell(p, r)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {rows.length === 0 && (
        <div className="px-3 py-4 text-center text-xs italic text-muted-foreground">
          No rows match
        </div>
      )}
    </div>
  );
}
