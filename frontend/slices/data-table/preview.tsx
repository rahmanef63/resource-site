"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { ColumnDef } from "@tanstack/react-table";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./components/DataTable";
import { DataTableColumnHeader } from "./components/data-table-column-header";

type Invoice = {
  id: string;
  customer: string;
  status: "paid" | "pending" | "overdue";
  amount: number;
  date: string;
};

const ROWS: Invoice[] = [
  { id: "INV-001", customer: "Acme Corp", status: "paid", amount: 1250, date: "2026-01-04" },
  { id: "INV-002", customer: "Globex", status: "pending", amount: 480, date: "2026-01-09" },
  { id: "INV-003", customer: "Soylent", status: "overdue", amount: 3200, date: "2026-01-11" },
  { id: "INV-004", customer: "Initech", status: "paid", amount: 760, date: "2026-01-15" },
  { id: "INV-005", customer: "Umbrella", status: "paid", amount: 5400, date: "2026-01-18" },
  { id: "INV-006", customer: "Hooli", status: "pending", amount: 920, date: "2026-01-22" },
  { id: "INV-007", customer: "Stark Ind", status: "overdue", amount: 1810, date: "2026-01-25" },
  { id: "INV-008", customer: "Wayne Ent", status: "paid", amount: 240, date: "2026-01-28" },
  { id: "INV-009", customer: "Wonka", status: "pending", amount: 6650, date: "2026-02-02" },
  { id: "INV-010", customer: "Cyberdyne", status: "paid", amount: 130, date: "2026-02-05" },
  { id: "INV-011", customer: "Tyrell", status: "overdue", amount: 2475, date: "2026-02-08" },
  { id: "INV-012", customer: "Aperture", status: "paid", amount: 880, date: "2026-02-12" },
];

const STATUS_VARIANT: Record<Invoice["status"], "default" | "secondary" | "destructive"> = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
};

const COLUMNS: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
  },
  {
    accessorKey: "customer",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const s = row.original.status;
      return <Badge variant={STATUS_VARIANT[s]} className="capitalize">{s}</Badge>;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => `$${row.original.amount.toLocaleString("en-US")}`,
  },
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
  },
];

const DataTablePreview: SlicePreviewModule["DataTable"] = ({ variant }) => {
  const density = (variant.density as "compact" | "comfortable") ?? "comfortable";
  const selectable = (variant.selectable ?? "on") !== "off";
  return (
    <div className="p-4">
      <DataTable
        columns={COLUMNS}
        data={ROWS}
        density={density}
        selectable={selectable}
        searchKey="customer"
        searchPlaceholder="Filter customers…"
        pageSize={6}
      />
    </div>
  );
};

const preview: SlicePreviewModule = { DataTable: DataTablePreview };
export default preview;
