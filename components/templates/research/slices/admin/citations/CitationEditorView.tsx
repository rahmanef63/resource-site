"use client";

import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type {
  EntityMeta,
  FieldDef,
} from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Citation } from "../../../shared/types";
import { useCitationsController } from "./CitationsView";

const META: EntityMeta = { label: "Sitasi", labelPlural: "Sitasi" };

export const FIELDS: FieldDef<Citation>[] = [
  { kind: "text", key: "bibKey", label: "Bib Key", mono: true },
  { kind: "text", key: "docId", label: "Document ID", mono: true },
  {
    kind: "select",
    key: "style",
    label: "Style",
    options: [
      { value: "APA", label: "APA" },
      { value: "MLA", label: "MLA" },
      { value: "Chicago", label: "Chicago" },
      { value: "IEEE", label: "IEEE" },
      { value: "BibTeX", label: "BibTeX" },
    ],
  },
  { kind: "date", key: "addedAt", label: "Ditambahkan" },
  { kind: "textarea", key: "rendered", label: "Rendered citation", rows: 5, mono: true },
];

export function CitationEditorView({ id }: { id: string }) {
  const controller = useCitationsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/citations`}
    />
  );
}
