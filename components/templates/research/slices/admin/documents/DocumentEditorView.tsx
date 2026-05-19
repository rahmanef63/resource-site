"use client";

import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type {
  EntityMeta,
  FieldDef,
} from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import type { Document } from "../../../shared/types";
import { useDocumentsController } from "./DocumentsView";

const META: EntityMeta = {
  label: "Dokumen",
  labelPlural: "Dokumen",
  publicHref: () => `${PUBLIC_BASE}/library`,
};

export const FIELDS: FieldDef<Document>[] = [
  { kind: "text", key: "title", label: "Judul" },
  { kind: "text", key: "authors", label: "Penulis" },
  { kind: "number", key: "year", label: "Tahun", min: 1900, max: 2100 },
  { kind: "text", key: "tag", label: "Tag" },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "uploaded", label: "Uploaded" },
      { value: "indexed", label: "Indexed" },
      { value: "reviewed", label: "Reviewed" },
    ],
  },
  { kind: "text", key: "fileLabel", label: "Label file", placeholder: "PDF · 24 hal" },
  { kind: "number", key: "pages", label: "Jumlah halaman", min: 0 },
  { kind: "number", key: "highlights", label: "Highlight", min: 0 },
  { kind: "date", key: "uploadedAt", label: "Diupload" },
  { kind: "textarea", key: "abstract", label: "Abstrak", rows: 5 },
];

export function DocumentEditorView({ id }: { id: string }) {
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
