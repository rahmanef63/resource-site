"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { fmtDate, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Customer } from "../../../shared/types";

const META: EntityMeta = { label: "Customer", labelPlural: "Customers" };

const COLUMNS: ColumnDef<Customer>[] = [
  { key: "name", header: "Name", width: "w-[20%]" },
  { key: "email", header: "Email", width: "w-[28%]", mono: true },
  { key: "plan", header: "Plan", width: "w-[12%]", badge: "outline" },
  { key: "status", header: "Status", width: "w-[12%]", badge: "secondary" },
  {
    key: "startedAt",
    header: "Started",
    width: "w-[14%]",
    render: (v) => <span className="tabular-nums">{fmtDate(Number(v))}</span>,
  },
];

function useCustomersController(): CrudController<Customer> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.customers,
      getId: (c) => c.id,
      blank: () => ({
        id: `cus-${Math.random().toString(36).slice(2, 10)}`,
        email: "",
        name: "New customer",
        plan: "free",
        status: "trial",
        startedAt: Date.now(),
      }),
      create: (c) => dispatch({ type: "CUSTOMER_UPSERT", payload: c }),
      update: (id, patch) =>
        dispatch({
          type: "CUSTOMER_UPSERT",
          payload: { ...state.customers.find((x) => x.id === id)!, ...patch, id },
        }),
      remove: (id) => dispatch({ type: "CUSTOMER_DELETE", payload: { id } }),
    }),
    [state.customers, dispatch],
  );
}

export function CustomersView() {
  const controller = useCustomersController();
  const active = controller.items.filter((c) => c.status === "active").length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      editPath={(id) => `${ADMIN_BASE}/customers/${id}`}
      description={`${active} active`}
    />
  );
}
