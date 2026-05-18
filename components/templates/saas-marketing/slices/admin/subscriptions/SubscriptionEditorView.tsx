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
import type { Subscription } from "../../../shared/types";

const META: EntityMeta = { label: "Subscription", labelPlural: "Subscriptions" };

const FIELDS: FieldDef<Subscription>[] = [
  { kind: "text", key: "customerEmail", label: "Customer email", mono: true },
  { kind: "text", key: "customerId", label: "Customer id", mono: true },
  {
    kind: "select",
    key: "plan",
    label: "Plan",
    options: [
      { value: "team", label: "Team" },
      { value: "scale", label: "Scale" },
    ],
  },
  {
    kind: "number",
    key: "mrrCents",
    label: "MRR (cents)",
    min: 0,
    step: 100,
  },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "trialing", label: "Trialing" },
      { value: "active", label: "Active" },
      { value: "past_due", label: "Past due" },
      { value: "canceled", label: "Canceled" },
    ],
  },
  { kind: "date", key: "renewsAt", label: "Renews at" },
];

function useSubscriptionsController(): CrudController<Subscription> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.subscriptions,
      getId: (s) => s.id,
      blank: () => ({
        id: `sub-${Math.random().toString(36).slice(2, 10)}`,
        customerId: "",
        customerEmail: "",
        plan: "team",
        mrrCents: 4900,
        status: "trialing",
        renewsAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }),
      create: (s) => dispatch({ type: "SUBSCRIPTION_UPSERT", payload: s }),
      update: (id, patch) =>
        dispatch({
          type: "SUBSCRIPTION_UPSERT",
          payload: { ...state.subscriptions.find((x) => x.id === id)!, ...patch, id },
        }),
      remove: (id) => dispatch({ type: "SUBSCRIPTION_DELETE", payload: { id } }),
    }),
    [state.subscriptions, dispatch],
  );
}

export function SubscriptionEditorView({ id }: { id: string }) {
  const controller = useSubscriptionsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/subscriptions`}
    />
  );
}
