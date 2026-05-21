"use client";

/** FeedView — chronological list (newest first by `updatedAt`). Pure
 *  presentation — caller already filter-sorts; this view just ignores
 *  view sorts and re-sorts by updated time for the timeline feel. */

import type { ViewProps } from "./types";

function fmt(ts: number) {
  if (!ts) return "";
  return new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function FeedView({ db, rows, renderCell }: ViewProps) {
  const sorted = [...rows].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  const visible = db.properties.filter((p) => !p.hidden);
  return (
    <ol className="divide-y divide-border">
      {sorted.map((r) => (
        <li key={r.id} className="flex gap-3 px-3 py-3 hover:bg-accent/20">
          <div className="w-20 shrink-0 text-[10px] text-muted-foreground">
            {fmt(r.updatedAt ?? 0)}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{r.title || "Untitled"}</div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
              {visible.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-1">
                  <span className="text-muted-foreground">{p.name}:</span>
                  <span className="max-w-[24ch] truncate">{renderCell(p, r)}</span>
                </div>
              ))}
            </div>
          </div>
        </li>
      ))}
      {sorted.length === 0 && (
        <li className="px-3 py-4 text-center text-xs italic text-muted-foreground">
          No rows match
        </li>
      )}
    </ol>
  );
}
