"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./LeadEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Lead } from "../../../shared/types";

const META: EntityMeta = { label: "Lead", labelPlural: "Leads" };

const COLUMNS: ColumnDef<Lead>[] = [
  { key: "name", header: "Name", width: "w-[16%]" },
  { key: "company", header: "Company", width: "w-[16%]" },
  { key: "topic", header: "Topic", width: "w-[22%]" },
  { key: "source", header: "Source", width: "w-[16%]", badge: "outline" },
  { key: "budget", header: "Budget", width: "w-[12%]" },
  { key: "status", header: "Status", width: "w-[10%]", badge: "secondary" },
];

function useLeadsController(): CrudController<Lead> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.leads,
      getId: (l) => l.id,
      blank: () => ({
        id: `lead-${Math.random().toString(36).slice(2, 10)}`,
        name: "New lead",
        company: "",
        email: "",
        phone: "",
        topic: "",
        source: "Contact form",
        budget: "",
        status: "new",
        ts: Date.now(),
      }),
      create: (lead) => dispatch({ type: "lead.create", lead }),
      update: (id, patch) => dispatch({ type: "lead.update", id, patch }),
      remove: (id) => dispatch({ type: "lead.delete", id }),
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
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/leads/${id}`}
      description={`${newCount} new`}
    />
  );
}
