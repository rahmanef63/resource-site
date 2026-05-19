"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { CrudController, EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Contract } from "../../../shared/types";

const META: EntityMeta = { label: "Contract", labelPlural: "Contracts" };

export const FIELDS: FieldDef<Contract>[] = [
  { kind: "text", key: "title", label: "Title" },
  { kind: "text", key: "clientId", label: "Client ID", mono: true },
  { kind: "text", key: "proposalId", label: "Proposal ID", mono: true },
  { kind: "textarea", key: "termsSummary", label: "Terms Summary", rows: 4 },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "signed", label: "Signed" },
      { value: "expired", label: "Expired" },
    ],
  },
  { kind: "date", key: "signedAt", label: "Signed At" },
  { kind: "date", key: "endsAt", label: "Ends At" },
];

function useContractsController(): CrudController<Contract> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.contracts,
      getId: (c) => c.id,
      blank: () => ({
        id: `ctr-${Math.random().toString(36).slice(2, 10)}`,
        proposalId: state.proposals[0]?.id ?? "",
        clientId: state.clients[0]?.id ?? "",
        title: "New Contract",
        termsSummary: "",
        status: "draft",
        signedAt: Date.now(),
        endsAt: Date.now() + 90 * 24 * 60 * 60 * 1000,
      }),
      create: (contract) => dispatch({ type: "contract.upsert", contract }),
      update: (id, patch) => {
        const cur = state.contracts.find((c) => c.id === id);
        if (!cur) return;
        dispatch({ type: "contract.upsert", contract: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "contract.delete", id }),
    }),
    [state.contracts, state.clients, state.proposals, dispatch],
  );
}

export function ContractEditorView({ id }: { id: string }) {
  const controller = useContractsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/contracts`}
    />
  );
}
