"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Order } from "../../../shared/types";
import { useOrdersController } from "./OrdersView";

const META: EntityMeta = { label: "Order", labelPlural: "Orders" };

function useFields(): FieldDef<Order>[] {
  const { state } = useStore();
  return React.useMemo<FieldDef<Order>[]>(
    () => [
      {
        kind: "select",
        key: "businessId",
        label: "Unit usaha",
        options: state.businesses.map((b) => ({ value: b.id, label: b.name })),
      },
      {
        kind: "select",
        key: "customerId",
        label: "Pelanggan",
        options: state.customers.map((c) => ({ value: c.id, label: c.name })),
      },
      { kind: "text", key: "totalLabel", label: "Total (label)", placeholder: "Rp 240k" },
      {
        kind: "select",
        key: "status",
        label: "Status",
        options: [
          { value: "new", label: "Baru" },
          { value: "processing", label: "Diproses" },
          { value: "shipped", label: "Dikirim" },
          { value: "delivered", label: "Selesai" },
          { value: "cancelled", label: "Dibatalkan" },
        ],
      },
      { kind: "date", key: "ts", label: "Tanggal order" },
    ],
    [state.businesses, state.customers],
  );
}

export function OrderEditorView({ id }: { id: string }) {
  const controller = useOrdersController();
  const fields = useFields();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={fields}
      backHref={`${ADMIN_BASE}/orders`}
    />
  );
}
