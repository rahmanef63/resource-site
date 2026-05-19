"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./InvoiceEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Invoice } from "../../../shared/types";

const META: EntityMeta = { label: "Invoice", labelPlural: "Invoices" };

const COLUMNS: ColumnDef<Invoice>[] = [
  { key: "number", header: "Number", width: "w-[18%]", mono: true },
  { key: "totalLabel", header: "Total", width: "w-[18%]" },
  { key: "ppnLabel", header: "PPN", width: "w-[18%]" },
  { key: "status", header: "Status", width: "w-[14%]", badge: "outline" },
  {
    key: "dueAt",
    header: "Due",
    width: "w-[18%]",
    render: (v) => (typeof v === "number" ? new Date(v).toLocaleDateString() : "—"),
  },
];

function useInvoicesController(): CrudController<Invoice> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.invoices,
      getId: (i) => i.id,
      blank: () => ({
        id: `inv-${Math.random().toString(36).slice(2, 10)}`,
        projectId: state.projects[0]?.id ?? "",
        clientId: state.clients[0]?.id ?? "",
        number: `INV-${new Date().getFullYear()}-${String(state.invoices.length + 1).padStart(3, "0")}`,
        amountLabel: "Rp 0",
        ppnLabel: "Rp 0 (11%)",
        totalLabel: "Rp 0",
        status: "draft",
        dueAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        issuedAt: Date.now(),
      }),
      create: (invoice) => dispatch({ type: "invoice.upsert", invoice }),
      update: (id, patch) => {
        const cur = state.invoices.find((i) => i.id === id);
        if (!cur) return;
        dispatch({ type: "invoice.upsert", invoice: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "invoice.delete", id }),
    }),
    [state.invoices, state.clients, state.projects, dispatch],
  );
}

export function BillingView() {
  const controller = useInvoicesController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/billing/${id}`}
      description="PajakAware invoicing (PPN 11%, e-Faktur)"
    />
  );
}
