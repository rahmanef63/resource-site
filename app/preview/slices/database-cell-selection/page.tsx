"use client";

import * as React from "react";
import { SelectableCell, useDragFill, type FillSource } from "@/features/database-cell-selection";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";

type Row = { id: string; name: string; status: string };

const INITIAL: Row[] = [
  { id: "r1", name: "Alice", status: "Active" },
  { id: "r2", name: "Bob", status: "" },
  { id: "r3", name: "Carol", status: "" },
  { id: "r4", name: "Dan", status: "" },
  { id: "r5", name: "Eve", status: "" },
];

const PROPS = ["name", "status"] as const;
type PropId = (typeof PROPS)[number];

export default function Page() {
  const [rows, setRows] = React.useState<Row[]>(INITIAL);
  const [sel, setSel] = React.useState<{ rowId: string; propId: PropId } | null>(null);

  const { source, start, isInFillRange } = useDragFill({
    rowIds: rows.map((r) => r.id),
    onFill: (src: FillSource, targetIds) => {
      const srcRow = rows.find((r) => r.id === src.rowId)!;
      const v = (srcRow as Record<string, string>)[src.propId];
      setRows((arr) =>
        arr.map((r) =>
          targetIds.includes(r.id) ? ({ ...r, [src.propId]: v } as Row) : r,
        ),
      );
    },
  });

  const inRange = (rowIdx: number, propId: PropId) =>
    Boolean(source && source.propId === propId && isInFillRange(rowIdx, propId));

  return (
    <SlicePreviewLayout title="Database Cell Selection" kind="ui">
      <PreviewSection
        title="Live demo"
        hint="click a cell · drag the bottom-right handle down to fill"
      >
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {PROPS.map((p) => (
                  <th key={p} className="p-2 text-left font-medium capitalize">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, rowIdx) => (
                <tr key={r.id} className="border-t border-border">
                  {PROPS.map((p) => {
                    const isSel = sel?.rowId === r.id && sel?.propId === p;
                    return (
                      <td key={p} className="h-10 p-0">
                        <SelectableCell
                          rowId={r.id}
                          propId={p}
                          selected={isSel}
                          inFillRange={inRange(rowIdx, p)}
                          showFillHandle={isSel}
                          onSelect={() => setSel({ rowId: r.id, propId: p })}
                          onStartFill={(_e) => start({ rowId: r.id, propId: p, rowIndex: rowIdx })}
                        >
                          <div className="p-2">{(r as Record<string, string>)[p] || <span className="text-muted-foreground">—</span>}</div>
                        </SelectableCell>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
