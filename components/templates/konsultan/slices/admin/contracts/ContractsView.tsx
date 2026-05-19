"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./ContractEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Contract } from "../../../shared/types";

const META: EntityMeta = { label: "Contract", labelPlural: "Contracts" };

const COLUMNS: ColumnDef<Contract>[] = [
  { key: "title", header: "Title", width: "w-[32%]" },
  { key: "status", header: "Status", width: "w-[14%]", badge: "outline" },
  {
    key: "signedAt",
    header: "Signed",
    width: "w-[18%]",
    render: (v) => (typeof v === "number" ? new Date(v).toLocaleDateString() : "—"),
  },
  {
    key: "endsAt",
    header: "Ends",
    width: "w-[18%]",
    render: (v) => (typeof v === "number" ? new Date(v).toLocaleDateString() : "—"),
  },
  { key: "clientId", header: "Client ID", width: "w-[10%]", mono: true },
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

export function ContractsView() {
  const controller = useContractsController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/contracts/${id}`}
      description="Kontrak ID-aware bilingual"
    />
  );
}
