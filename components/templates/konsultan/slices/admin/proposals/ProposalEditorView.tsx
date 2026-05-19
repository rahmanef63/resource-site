"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { CrudController, EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Proposal } from "../../../shared/types";

const META: EntityMeta = { label: "Proposal", labelPlural: "Proposals" };

export const FIELDS: FieldDef<Proposal>[] = [
  { kind: "text", key: "title", label: "Title" },
  { kind: "text", key: "clientId", label: "Client ID", mono: true, hint: "ID dari Clients" },
  { kind: "textarea", key: "scope", label: "Scope of Work", rows: 4 },
  { kind: "text", key: "valueLabel", label: "Value", placeholder: "Rp 80jt" },
  { kind: "text", key: "durationLabel", label: "Duration", placeholder: "3 bulan" },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "sent", label: "Sent" },
      { value: "accepted", label: "Accepted" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  { kind: "date", key: "createdAt", label: "Created" },
];

function useProposalsController(): CrudController<Proposal> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.proposals,
      getId: (p) => p.id,
      blank: () => ({
        id: `prop-${Math.random().toString(36).slice(2, 10)}`,
        clientId: state.clients[0]?.id ?? "",
        title: "New Proposal",
        scope: "",
        valueLabel: "Rp 0",
        durationLabel: "1 bulan",
        status: "draft",
        createdAt: Date.now(),
      }),
      create: (proposal) => dispatch({ type: "proposal.upsert", proposal }),
      update: (id, patch) => {
        const cur = state.proposals.find((p) => p.id === id);
        if (!cur) return;
        dispatch({ type: "proposal.upsert", proposal: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "proposal.delete", id }),
    }),
    [state.proposals, state.clients, dispatch],
  );
}

export function ProposalEditorView({ id }: { id: string }) {
  const controller = useProposalsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/proposals`}
    />
  );
}
