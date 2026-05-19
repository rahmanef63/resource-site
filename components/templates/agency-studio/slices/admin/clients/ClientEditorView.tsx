"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { CrudController, EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Client } from "../../../shared/types";

const META: EntityMeta = { label: "Client", labelPlural: "Clients" };

export const FIELDS: FieldDef<Client>[] = [
  { kind: "text", key: "name", label: "Name" },
  { kind: "text", key: "industry", label: "Industry" },
  { kind: "text", key: "contact", label: "Contact person" },
  { kind: "text", key: "email", label: "Email", mono: true },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "prospect", label: "Prospect" },
      { value: "alumni", label: "Alumni" },
    ],
  },
  { kind: "date", key: "startedAt", label: "Engaged since" },
  { kind: "textarea", key: "notes", label: "Notes", rows: 4 },
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

export function ClientEditorView({ id }: { id: string }) {
  const controller = useClientsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/clients`}
    />
  );
}
