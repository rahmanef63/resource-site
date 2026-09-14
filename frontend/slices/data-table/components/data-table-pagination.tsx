"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  dataTablePageSummary,
  dataTableRowSummary,
  type DataTableLabels,
} from "../lib/core";

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  selectable?: boolean;
  labels: DataTableLabels;
}

export function DataTablePagination<TData>({
  table,
  selectable = false,
  labels,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const filtered = table.getFilteredRowModel().rows.length;
  const selected = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-2">
      <div className="text-xs text-muted-foreground">
        {dataTableRowSummary(filtered, selected, selectable, labels)}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-muted-foreground">
          {dataTablePageSummary(pageIndex, pageCount, labels)}
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
            {labels.previous}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {labels.next}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
