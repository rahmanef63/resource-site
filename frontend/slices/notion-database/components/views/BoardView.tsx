"use client";

/** BoardView — kanban grouped by the view's `groupBy` select property.
 *  Falls back to "No grouping property" message if missing. Each card
 *  renders title + every visible property cell (compact). */

import { cn } from "rahman-shared/lib/utils";
import { groupBy as groupRows } from "../../lib/viewData";
import type { ViewProps } from "./types";

export function BoardView({ db, view, rows, renderCell }: ViewProps) {
  const groupProp = db.properties.find((p) => p.id === view.groupBy);
  if (!groupProp || (groupProp.type !== "select" && groupProp.type !== "status")) {
    return (
      <div className="px-4 py-8 text-center text-xs text-muted-foreground">
        Board view needs a <span className="font-medium">select</span> or{" "}
        <span className="font-medium">status</span> property to group by. Set
        one via the view options.
      </div>
    );
  }

  const groups = groupRows(rows, groupProp);

  return (
    <div className="flex h-full gap-3 overflow-x-auto p-3">
      {groups.map((g) => (
        <div key={g.key ?? "_none"} className="flex w-64 shrink-0 flex-col rounded-md border border-border bg-muted/20">
          <div className={cn("flex items-center justify-between border-b border-border px-3 py-2")}>
            <span className="text-xs font-medium">{g.label}</span>
            <span className="text-[10px] text-muted-foreground">{g.rows.length}</span>
          </div>
          <div className="flex flex-col gap-2 p-2">
            {g.rows.map((r) => (
              <div key={r.id} className="rounded-md border border-border bg-card p-2 shadow-sm">
                <div className="mb-1 text-sm font-medium">{r.title || "Untitled"}</div>
                <div className="space-y-1">
                  {db.properties.filter((p) => !p.hidden && p.id !== groupProp.id).slice(0, 4).map((p) => (
                    <div key={p.id} className="text-[11px]">{renderCell(p, r)}</div>
                  ))}
                </div>
              </div>
            ))}
            {g.rows.length === 0 && (
              <div className="px-2 py-3 text-center text-[11px] italic text-muted-foreground">empty</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
