"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  /** Show "n of m row(s) selected" on the left when selection is enabled. */
  selectable?: boolean;
}

/**
 * Previous / Next pager with a "page X of Y" readout. When `selectable`, also
 * surfaces the selected-row count on the left.
 */
export function DataTablePagination<TData>({
  table,
  selectable,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-2">
      <div className="text-xs text-muted-foreground">
        {selectable ? (
          <span>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} selected
          </span>
        ) : (
          <span>{table.getFilteredRowModel().rows.length} row(s)</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-muted-foreground">
          Page {pageIndex + 1} of {Math.max(pageCount, 1)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
