"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { rel, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Lead } from "../../../shared/types";

const META: EntityMeta = { label: "Lead", labelPlural: "Leads" };

const COLUMNS: ColumnDef<Lead>[] = [
  { key: "name", header: "Name", width: "w-[22%]" },
  { key: "email", header: "Email", width: "w-[28%]", mono: true },
  { key: "source", header: "Source", width: "w-[14%]", badge: "outline" },
  { key: "status", header: "Status", width: "w-[12%]", badge: "secondary" },
  {
    key: "ts",
    header: "Received",
    width: "w-[14%]",
    render: (v) => <span className="tabular-nums">{rel(Number(v))}</span>,
  },
];

function useLeadsController(): CrudController<Lead> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.leads,
      getId: (l) => l.id,
      blank: () => ({
        id: `lead-${Math.random().toString(36).slice(2, 10)}`,
        email: "",
        name: "New lead",
        source: "website",
        status: "new",
        ts: Date.now(),
      }),
      create: (l) => dispatch({ type: "LEAD_UPSERT", payload: l }),
      update: (id, patch) =>
        dispatch({
          type: "LEAD_UPSERT",
          payload: { ...state.leads.find((x) => x.id === id)!, ...patch, id },
        }),
      remove: (id) => dispatch({ type: "LEAD_DELETE", payload: { id } }),
    }),
    [state.leads, dispatch],
  );
}

export function LeadsView() {
  const controller = useLeadsController();
  const newCount = controller.items.filter((l) => l.status === "new").length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      editPath={(id) => `${ADMIN_BASE}/leads/${id}`}
      description={`${newCount} new`}
    />
  );
}
