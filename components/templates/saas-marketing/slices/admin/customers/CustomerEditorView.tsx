"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type {
  CrudController,
  EntityMeta,
  FieldDef,
} from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Customer } from "../../../shared/types";

const META: EntityMeta = { label: "Customer", labelPlural: "Customers" };

const FIELDS: FieldDef<Customer>[] = [
  { kind: "text", key: "name", label: "Name" },
  { kind: "text", key: "email", label: "Email", mono: true },
  {
    kind: "select",
    key: "plan",
    label: "Plan",
    options: [
      { value: "free", label: "Free" },
      { value: "team", label: "Team" },
      { value: "scale", label: "Scale" },
    ],
  },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "trial", label: "Trial" },
      { value: "active", label: "Active" },
      { value: "churned", label: "Churned" },
    ],
  },
  { kind: "date", key: "startedAt", label: "Started" },
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

export function CustomerEditorView({ id }: { id: string }) {
  const controller = useCustomersController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/customers`}
    />
  );
}
