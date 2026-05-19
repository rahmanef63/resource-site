"use client";

import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type {
  EntityMeta,
  FieldDef,
} from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Note } from "../../../shared/types";
import { useNotesController } from "./NotesView";

const META: EntityMeta = { label: "Catatan", labelPlural: "Catatan" };

export const FIELDS: FieldDef<Note>[] = [
  { kind: "text", key: "title", label: "Judul" },
  { kind: "date", key: "updatedAt", label: "Diperbarui" },
  { kind: "tags", key: "tags", label: "Tag", hint: "Pisah dengan koma" },
  {
    kind: "tags",
    key: "linkedDocIds",
    label: "Linked document IDs",
    hint: "ID dokumen, pisah dengan koma",
  },
  { kind: "textarea", key: "body", label: "Isi catatan", rows: 8 },
];

export function NoteEditorView({ id }: { id: string }) {
  const controller = useNotesController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/notes`}
    />
  );
}
