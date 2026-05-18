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
import type { Lead } from "../../../shared/types";

const META: EntityMeta = { label: "Lead", labelPlural: "Leads" };

const FIELDS: FieldDef<Lead>[] = [
  { kind: "text", key: "name", label: "Name" },
  { kind: "text", key: "email", label: "Email", mono: true },
  {
    kind: "select",
    key: "source",
    label: "Source",
    options: [
      { value: "website", label: "Website" },
      { value: "referral", label: "Referral" },
      { value: "ad", label: "Ad" },
      { value: "event", label: "Event" },
    ],
  },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "new", label: "New" },
      { value: "contacted", label: "Contacted" },
      { value: "qualified", label: "Qualified" },
      { value: "won", label: "Won" },
      { value: "lost", label: "Lost" },
    ],
  },
  { kind: "date", key: "ts", label: "Received" },
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

export function LeadEditorView({ id }: { id: string }) {
  const controller = useLeadsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/leads`}
    />
  );
}
