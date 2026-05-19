"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./ConsultDocEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { ConsultDoc } from "../../../shared/types";

const META: EntityMeta = { label: "Document", labelPlural: "Documents" };

const COLUMNS: ColumnDef<ConsultDoc>[] = [
  { key: "title", header: "Title", width: "w-[36%]" },
  { key: "kind", header: "Kind", width: "w-[16%]", badge: "outline" },
  { key: "status", header: "Status", width: "w-[14%]", badge: "outline" },
  {
    key: "updatedAt",
    header: "Updated",
    width: "w-[18%]",
    render: (v) => (typeof v === "number" ? new Date(v).toLocaleDateString() : "—"),
  },
  { key: "projectId", header: "Project ID", width: "w-[12%]", mono: true },
];

function useDocumentsController(): CrudController<ConsultDoc> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.documents,
      getId: (d) => d.id,
      blank: () => ({
        id: `doc-${Math.random().toString(36).slice(2, 10)}`,
        projectId: state.projects[0]?.id ?? "",
        title: "New Document",
        kind: "deliverable",
        status: "draft",
        updatedAt: Date.now(),
      }),
      create: (doc) => dispatch({ type: "document.upsert", doc }),
      update: (id, patch) => {
        const cur = state.documents.find((d) => d.id === id);
        if (!cur) return;
        dispatch({ type: "document.upsert", doc: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "document.delete", id }),
    }),
    [state.documents, state.projects, dispatch],
  );
}

export function DocumentsView() {
  const controller = useDocumentsController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/documents/${id}`}
      description="Deliverables, memo, minutes per project"
    />
  );
}
