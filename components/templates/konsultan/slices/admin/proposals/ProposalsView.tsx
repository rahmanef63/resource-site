"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./ProposalEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Proposal } from "../../../shared/types";

const META: EntityMeta = { label: "Proposal", labelPlural: "Proposals" };

const COLUMNS: ColumnDef<Proposal>[] = [
  { key: "title", header: "Title", width: "w-[30%]" },
  { key: "valueLabel", header: "Value", width: "w-[16%]" },
  { key: "durationLabel", header: "Duration", width: "w-[16%]" },
  { key: "status", header: "Status", width: "w-[14%]", badge: "outline" },
  { key: "clientId", header: "Client ID", width: "w-[10%]", mono: true },
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

export function ProposalsView() {
  const controller = useProposalsController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/proposals/${id}`}
      description="Generate proposal AI dari brief"
    />
  );
}
