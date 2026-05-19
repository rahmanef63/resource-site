"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { CrudController, EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Project } from "../../../shared/types";

const META: EntityMeta = { label: "Project", labelPlural: "Projects" };

export const FIELDS: FieldDef<Project>[] = [
  { kind: "text", key: "name", label: "Name" },
  { kind: "text", key: "clientId", label: "Client ID", mono: true },
  { kind: "text", key: "contractId", label: "Contract ID", mono: true },
  { kind: "textarea", key: "description", label: "Description", rows: 3 },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "kickoff", label: "Kickoff" },
      { value: "in-progress", label: "In Progress" },
      { value: "review", label: "Review" },
      { value: "delivered", label: "Delivered" },
    ],
  },
  { kind: "number", key: "progress", label: "Progress %", min: 0, max: 100, step: 1 },
  { kind: "date", key: "startedAt", label: "Started At" },
  { kind: "date", key: "endsAt", label: "Ends At" },
];

function useProjectsController(): CrudController<Project> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.projects,
      getId: (p) => p.id,
      blank: () => ({
        id: `proj-${Math.random().toString(36).slice(2, 10)}`,
        contractId: state.contracts[0]?.id ?? "",
        clientId: state.clients[0]?.id ?? "",
        name: "New Project",
        description: "",
        status: "kickoff",
        progress: 0,
        startedAt: Date.now(),
        endsAt: Date.now() + 60 * 24 * 60 * 60 * 1000,
      }),
      create: (project) => dispatch({ type: "project.upsert", project }),
      update: (id, patch) => {
        const cur = state.projects.find((p) => p.id === id);
        if (!cur) return;
        dispatch({ type: "project.upsert", project: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "project.delete", id }),
    }),
    [state.projects, state.clients, state.contracts, dispatch],
  );
}

export function ProjectEditorView({ id }: { id: string }) {
  const controller = useProjectsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/projects`}
    />
  );
}
