"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DEFAULT_DATA_TABLE_LABELS,
  type DataTableLabels,
} from "./core";

export function selectionColumn<TData>(
  labels: Pick<DataTableLabels, "selectAllRows" | "selectRow"> = DEFAULT_DATA_TABLE_LABELS,
): ColumnDef<TData> {
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
        "aria-label": labels.selectAllRows,
      }),
    cell: ({ row }) =>
      React.createElement(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value: boolean | "indeterminate") => row.toggleSelected(!!value),
        "aria-label": labels.selectRow,
      }),
  };
}
