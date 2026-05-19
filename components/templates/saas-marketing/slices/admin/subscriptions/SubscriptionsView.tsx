"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./SubscriptionEditorView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { fmtDate, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Subscription } from "../../../shared/types";

const META: EntityMeta = { label: "Subscription", labelPlural: "Subscriptions" };

const fmtMrr = (cents: number) => `$${(cents / 100).toFixed(0)}/mo`;

const COLUMNS: ColumnDef<Subscription>[] = [
  { key: "customerEmail", header: "Customer", width: "w-[32%]", mono: true },
  { key: "plan", header: "Plan", width: "w-[12%]", badge: "outline" },
  {
    key: "mrrCents",
    header: "MRR",
    width: "w-[12%]",
    render: (v) => <span className="tabular-nums">{fmtMrr(Number(v))}</span>,
  },
  { key: "status", header: "Status", width: "w-[14%]", badge: "secondary" },
  {
    key: "renewsAt",
    header: "Renews",
    width: "w-[16%]",
    render: (v) => <span className="tabular-nums">{fmtDate(Number(v))}</span>,
  },
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

export function SubscriptionsView() {
  const controller = useSubscriptionsController();
  const active = controller.items.filter((s) => s.status === "active");
  const mrrCents = active.reduce((acc, s) => acc + s.mrrCents, 0);
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/subscriptions/${id}`}
      description={`${active.length} active · MRR $${(mrrCents / 100).toFixed(0)}`}
    />
  );
}
