"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { selectionColumn } from "../lib/columns-helpers";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Row padding. "compact" tightens cell padding. Default "comfortable". */
  density?: "compact" | "comfortable";
  /** Prepend a checkbox row-selection column. */
  selectable?: boolean;
  /** Column id bound to the toolbar search input. Omit to hide search. */
  searchKey?: string;
  searchPlaceholder?: string;
  /** Rows per page. Default 10. */
  pageSize?: number;
  className?: string;
}

/**
 * Generic, prop-driven data table built on TanStack Table v8 + shadcn `Table`.
 * Wires sorting, column-filter search, pagination, row selection, and column
 * visibility through a single `useReactTable` instance.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  density = "comfortable",
  selectable = false,
  searchKey,
  searchPlaceholder,
  pageSize = 10,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const resolvedColumns = React.useMemo(
    () =>
      selectable
        ? [selectionColumn<TData>() as ColumnDef<TData, TValue>, ...columns]
        : columns,
    [columns, selectable],
  );

  const table = useReactTable({
    data,
    columns: resolvedColumns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    enableRowSelection: selectable,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const cellPad = density === "compact" ? "py-1" : "py-2.5";

  return (
    <div className={cn("w-full", className)}>
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className={cellPad}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cellPad}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={resolvedColumns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} selectable={selectable} />
    </div>
  );
}
