"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./ClientEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Client } from "../../../shared/types";

const META: EntityMeta = { label: "Client", labelPlural: "Clients" };

const COLUMNS: ColumnDef<Client>[] = [
  { key: "name", header: "Name", width: "w-[22%]" },
  { key: "company", header: "Company", width: "w-[22%]" },
  { key: "industry", header: "Industry", width: "w-[16%]" },
  { key: "city", header: "City", width: "w-[14%]" },
  { key: "status", header: "Status", width: "w-[12%]", badge: "outline" },
];

function useClientsController(): CrudController<Client> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.clients,
      getId: (c) => c.id,
      blank: () => ({
        id: `client-${Math.random().toString(36).slice(2, 10)}`,
        name: "New Client",
        company: "",
        industry: "",
        email: "",
        phone: "",
        city: "",
        status: "lead",
        createdAt: Date.now(),
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
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/clients/${id}`}
      description="CRM lead → aktif → completed"
    />
  );
}
