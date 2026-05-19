"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./DocumentEditorView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import { useStore } from "../../../shared/store";
import type { Document } from "../../../shared/types";

const META: EntityMeta = {
  label: "Dokumen",
  labelPlural: "Dokumen",
  publicHref: () => `${PUBLIC_BASE}/library`,
};

const COLUMNS: ColumnDef<Document>[] = [
  { key: "title", header: "Judul", width: "w-[30%]" },
  { key: "authors", header: "Penulis", width: "w-[22%]" },
  { key: "year", header: "Tahun", width: "w-[8%]" },
  { key: "tag", header: "Tag", width: "w-[12%]", badge: "outline" },
  { key: "status", header: "Status", width: "w-[10%]", badge: "secondary" },
  { key: "pages", header: "Hal", width: "w-[6%]" },
];

export function useDocumentsController(): CrudController<Document> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.documents,
      getId: (d) => d.id,
      blank: () => ({
        id: `doc-${Date.now().toString(36)}`,
        title: "Dokumen baru",
        authors: "",
        year: new Date().getFullYear(),
        fileLabel: "PDF · 0 hal",
        abstract: "",
        tag: "umum",
        status: "uploaded" as const,
        uploadedAt: Date.now(),
        pages: 0,
        highlights: 0,
      }),
      create: (doc) => dispatch({ type: "doc.upsert", doc }),
      update: (id, patch) => {
        const cur = state.documents.find((d) => d.id === id);
        if (!cur) return;
        dispatch({ type: "doc.upsert", doc: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "doc.delete", id }),
    }),
    [state.documents, dispatch],
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
      description="Upload PDF/DOCX, OCR otomatis, indeks vektor untuk pencarian semantik."
    />
  );
}
