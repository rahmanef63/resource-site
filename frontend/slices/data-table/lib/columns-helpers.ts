"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

/**
 * Build a checkbox row-selection column. Prepended automatically by
 * `DataTable` when `selectable` is set; exported so consumers can place it
 * manually if they want finer control over column order.
 */
export function selectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) =>
      React.createElement(Checkbox, {
        checked: table.getIsAllPageRowsSelected()
          ? true
          : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false,
        onCheckedChange: (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all rows",
      }),
    cell: ({ row }) =>
      React.createElement(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
  };
}
