"use client";

/** GalleryView — card grid (3-up at md, 4-up at lg). Card top shows the
 *  doc's icon emoji or first letter; body shows title + first 3 visible
 *  property cells. Cover image rendering deferred to BJ-wave (when
 *  NotionPage cover ships). */

import type { ViewProps } from "./types";

export function GalleryView({ db, rows, renderCell }: ViewProps) {
  const visible = db.properties.filter((p) => !p.hidden);
  return (
    <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-4">
      {rows.map((r) => (
        <div
          key={r.id}
          className="overflow-hidden rounded-md border border-border bg-card shadow-sm"
        >
          <div className="flex h-20 items-center justify-center bg-muted/40 text-3xl">
            {r.icon || (r.title?.[0]?.toUpperCase() ?? "·")}
          </div>
          <div className="p-2">
            <div className="mb-1 truncate text-sm font-medium">{r.title || "Untitled"}</div>
            <div className="space-y-1">
              {visible.slice(0, 3).map((p) => (
                <div key={p.id} className="truncate text-[11px]">{renderCell(p, r)}</div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {rows.length === 0 && (
        <div className="col-span-full px-3 py-6 text-center text-xs italic text-muted-foreground">
          No rows match
        </div>
      )}
    </div>
  );
}
