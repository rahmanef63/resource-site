"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./ProjectEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Project } from "../../../shared/types";

const META: EntityMeta = { label: "Project", labelPlural: "Projects" };

const COLUMNS: ColumnDef<Project>[] = [
  { key: "name", header: "Name", width: "w-[30%]" },
  { key: "status", header: "Status", width: "w-[16%]", badge: "outline" },
  {
    key: "progress",
    header: "Progress",
    width: "w-[14%]",
    render: (v) => `${Number(v ?? 0)}%`,
  },
  {
    key: "endsAt",
    header: "Ends",
    width: "w-[18%]",
    render: (v) => (typeof v === "number" ? new Date(v).toLocaleDateString() : "—"),
  },
  { key: "clientId", header: "Client ID", width: "w-[10%]", mono: true },
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

export function ProjectsView() {
  const controller = useProjectsController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/projects/${id}`}
      description="Project tracker dengan milestone"
    />
  );
}
