"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { CrudController, EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { ConsultDoc } from "../../../shared/types";

const META: EntityMeta = { label: "Document", labelPlural: "Documents" };

export const FIELDS: FieldDef<ConsultDoc>[] = [
  { kind: "text", key: "title", label: "Title" },
  { kind: "text", key: "projectId", label: "Project ID", mono: true },
  {
    kind: "select",
    key: "kind",
    label: "Kind",
    options: [
      { value: "deliverable", label: "Deliverable" },
      { value: "memo", label: "Memo" },
      { value: "minutes", label: "Minutes" },
      { value: "report", label: "Report" },
    ],
  },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "shared", label: "Shared" },
    ],
  },
  { kind: "date", key: "updatedAt", label: "Updated At" },
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

export function ConsultDocEditorView({ id }: { id: string }) {
  const controller = useDocumentsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/documents`}
    />
  );
}
