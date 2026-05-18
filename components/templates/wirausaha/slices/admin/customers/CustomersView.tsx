"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Customer } from "../../../shared/types";

const META: EntityMeta = { label: "Pelanggan", labelPlural: "Customers" };

const COLUMNS: ColumnDef<Customer>[] = [
  { key: "name", header: "Nama", width: "w-[26%]" },
  { key: "phone", header: "Telepon", width: "w-[22%]", mono: true },
  { key: "city", header: "Kota", width: "w-[16%]" },
  { key: "totalSpentLabel", header: "Total spent", width: "w-[14%]" },
  { key: "orderCount", header: "Order", width: "w-[8%]" },
];

export function useCustomersController(): CrudController<Customer> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.customers,
      getId: (c) => c.id,
      blank: () => ({
        id: `cust-${Math.random().toString(36).slice(2, 10)}`,
        name: "Pelanggan baru",
        phone: "",
        city: "",
        totalSpentLabel: "Rp 0",
        orderCount: 0,
      }),
      create: (customer) => dispatch({ type: "customer.upsert", customer }),
      update: (id, patch) => {
        const cur = state.customers.find((c) => c.id === id);
        if (!cur) return;
        dispatch({ type: "customer.upsert", customer: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "customer.delete", id }),
    }),
    [state.customers, dispatch],
  );
}

export function CustomersView() {
  const controller = useCustomersController();
  const totalOrders = controller.items.reduce((s, c) => s + c.orderCount, 0);
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      editPath={(id) => `${ADMIN_BASE}/customers/${id}`}
      description={`${totalOrders} order kumulatif`}
    />
  );
}
