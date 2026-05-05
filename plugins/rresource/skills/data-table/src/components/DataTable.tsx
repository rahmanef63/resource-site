// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import {
  flexRender, getCoreRowModel, getSortedRowModel, getPaginationRowModel,
  useReactTable, type ColumnDef, type SortingState,
} from "@tanstack/react-table";

type Props<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
  className?: string;
};

export function DataTable<T>({ columns, data, pageSize = 20, className }: Props<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    data, columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className={className ?? "rounded border"}>
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b bg-muted/40">
              {hg.headers.map((h) => (
                <th key={h.id} onClick={h.column.getToggleSortingHandler()} className="cursor-pointer px-3 py-2 text-left font-medium">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => (
            <tr key={r.id} className="border-b">
              {r.getVisibleCells().map((c) => (
                <td key={c.id} className="px-3 py-2">{flexRender(c.column.columnDef.cell, c.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t px-3 py-2 text-xs">
        <span>Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
        <div className="flex gap-1">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="rounded border px-2 py-0.5">‹</button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="rounded border px-2 py-0.5">›</button>
        </div>
      </div>
    </div>
  );
}
