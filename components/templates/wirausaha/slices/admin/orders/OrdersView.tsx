"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Order } from "../../../shared/types";
import { useFields } from "./OrderEditorView";

const META: EntityMeta = { label: "Order", labelPlural: "Orders" };

function useColumns(): ColumnDef<Order>[] {
  const { state } = useStore();
  const bizMap = React.useMemo(
    () => new Map(state.businesses.map((b) => [b.id, b.name])),
    [state.businesses],
  );
  const custMap = React.useMemo(
    () => new Map(state.customers.map((c) => [c.id, c.name])),
    [state.customers],
  );
  return React.useMemo<ColumnDef<Order>[]>(
    () => [
      { key: "id", header: "ID", width: "w-[14%]", mono: true },
      {
        key: "customerId",
        header: "Pelanggan",
        width: "w-[22%]",
        render: (v) => custMap.get(String(v)) ?? "—",
      },
      {
        key: "businessId",
        header: "Unit",
        width: "w-[20%]",
        render: (v) => bizMap.get(String(v)) ?? "—",
      },
      {
        key: "items",
        header: "Item",
        width: "w-[10%]",
        render: (v) => `${Array.isArray(v) ? v.length : 0} item`,
      },
      { key: "totalLabel", header: "Total", width: "w-[12%]" },
      { key: "status", header: "Status", width: "w-[12%]", badge: "secondary" },
    ],
    [bizMap, custMap],
  );
}

export function useOrdersController(): CrudController<Order> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.orders,
      getId: (o) => o.id,
      blank: () => ({
        id: `ord-${Math.random().toString(36).slice(2, 10)}`,
        businessId: state.businesses[0]?.id ?? "",
        customerId: state.customers[0]?.id ?? "",
        items: [],
        totalLabel: "Rp 0",
        status: "new",
        ts: Date.now(),
      }),
      create: (order) => dispatch({ type: "order.upsert", order }),
      update: (id, patch) => {
        const cur = state.orders.find((o) => o.id === id);
        if (!cur) return;
        dispatch({ type: "order.upsert", order: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "order.delete", id }),
    }),
    [state.orders, state.businesses, state.customers, dispatch],
  );
}

export function OrdersView() {
  const controller = useOrdersController();
  const columns = useColumns();
  const fields = useFields();
  const newOrders = controller.items.filter((o) => o.status === "new").length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={columns}
      fields={fields}
      editPath={(id) => `${ADMIN_BASE}/orders/${id}`}
      description={`${newOrders} order baru`}
    />
  );
}
