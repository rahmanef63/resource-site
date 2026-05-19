"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./ClientEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore, fmtDate } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Client } from "../../../shared/types";

const META: EntityMeta = { label: "Client", labelPlural: "Clients" };

const COLUMNS: ColumnDef<Client>[] = [
  { key: "name", header: "Name", width: "w-[20%]" },
  { key: "industry", header: "Industry", width: "w-[14%]" },
  { key: "contact", header: "Contact", width: "w-[16%]" },
  { key: "email", header: "Email", width: "w-[20%]", mono: true },
  { key: "status", header: "Status", width: "w-[10%]", badge: "secondary" },
  { key: "startedAt", header: "Since", width: "w-[10%]", render: (v) => fmtDate(Number(v)) },
];

function useClientsController(): CrudController<Client> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.clients,
      getId: (c) => c.id,
      blank: () => ({
        id: `client-${Math.random().toString(36).slice(2, 10)}`,
        name: "New client",
        industry: "",
        contact: "",
        email: "",
        status: "prospect",
        startedAt: Date.now(),
        notes: "",
      }),
      create: (client) => dispatch({ type: "client.upsert", client }),
      update: (id, patch) => {
        const cur = state.clients.find((c) => c.id === id);
        if (!cur) return;
        dispatch({ type: "client.upsert", client: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "client.delete", id }),
    }),
    [state.clients, dispatch],
  );
}

export function ClientsView() {
  const controller = useClientsController();
  const activeCount = controller.items.filter((c) => c.status === "active").length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/clients/${id}`}
      description={`${activeCount} active`}
    />
  );
}
