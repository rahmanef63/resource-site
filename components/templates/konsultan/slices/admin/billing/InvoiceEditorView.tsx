"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { CrudController, EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Invoice } from "../../../shared/types";

const META: EntityMeta = { label: "Invoice", labelPlural: "Invoices" };

export const FIELDS: FieldDef<Invoice>[] = [
  { kind: "text", key: "number", label: "Invoice Number", mono: true },
  { kind: "text", key: "clientId", label: "Client ID", mono: true },
  { kind: "text", key: "projectId", label: "Project ID", mono: true },
  { kind: "text", key: "amountLabel", label: "Subtotal", placeholder: "Rp 80jt" },
  { kind: "text", key: "ppnLabel", label: "PPN", placeholder: "Rp 8.8jt (11%)" },
  { kind: "text", key: "totalLabel", label: "Total", placeholder: "Rp 88.8jt" },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "sent", label: "Sent" },
      { value: "paid", label: "Paid" },
      { value: "overdue", label: "Overdue" },
    ],
  },
  { kind: "date", key: "issuedAt", label: "Issued At" },
  { kind: "date", key: "dueAt", label: "Due At" },
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

export function InvoiceEditorView({ id }: { id: string }) {
  const controller = useInvoicesController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/billing`}
    />
  );
}
