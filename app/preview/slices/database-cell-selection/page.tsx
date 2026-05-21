"use client";

import * as React from "react";
import { useDragFill, SelectableCell, type FillSource } from "@/features/database-cell-selection";

const ROWS = ["r1", "r2", "r3", "r4", "r5"];
const COLS = [
  { id: "name", label: "Name" },
  { id: "status", label: "Status" },
  { id: "owner", label: "Owner" },
];

type CellKey = `${string}:${string}`;
const initial: Record<CellKey, string> = {
  "r1:name": "Alpha", "r1:status": "active",   "r1:owner": "MK",
  "r2:name": "Bravo", "r2:status": "pending",  "r2:owner": "RE",
  "r3:name": "Echo",  "r3:status": "active",   "r3:owner": "DP",
  "r4:name": "Tango", "r4:status": "active",   "r4:owner": "FA",
  "r5:name": "Zulu",  "r5:status": "archived", "r5:owner": "SN",
};

/** Minimal interactive preview: 5×3 grid. Click a cell to select.
 *  Drag the bottom-right handle to fill values down a column. */
export default function Page() {
  const [cells, setCells] = React.useState(initial);
  const [selected, setSelected] = React.useState<CellKey | null>("r1:status");

  const onFill = React.useCallback((src: FillSource, targetRowIds: string[]) => {
    setCells((prev) => {
      const val = prev[`${src.rowId}:${src.propId}` as CellKey];
      const next = { ...prev };
      for (const r of targetRowIds) {
        next[`${r}:${src.propId}` as CellKey] = val;
      }
      return next;
    });
  }, []);

  const { start, isInFillRange } = useDragFill({ rowIds: ROWS, onFill });

  return (
    <main className="mx-auto grid min-h-screen max-w-xl place-items-center bg-background p-6">
      <div className="w-full overflow-hidden rounded-lg border bg-card">
        <div className="grid grid-cols-3 border-b bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
          {COLS.map((c) => (
            <div key={c.id} className="px-3 py-2">{c.label}</div>
          ))}
        </div>
        {ROWS.map((rowId, rowIndex) => (
          <div key={rowId} className="grid grid-cols-3 border-b last:border-b-0">
            {COLS.map((col) => {
              const key = `${rowId}:${col.id}` as CellKey;
              const isSelected = selected === key;
              return (
                <SelectableCell
                  key={col.id}
                  rowId={rowId}
                  propId={col.id}
                  selected={isSelected}
                  inFillRange={isInFillRange(rowIndex, col.id)}
                  showFillHandle={isSelected}
                  onSelect={() => setSelected(key)}
                  onStartFill={() => start({ rowId, propId: col.id, rowIndex })}
                >
                  <div className="px-3 py-2 text-xs">{cells[key]}</div>
                </SelectableCell>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
