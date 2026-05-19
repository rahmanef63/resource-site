"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./NoteEditorView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE } from "../../../shared/nav-config";
import { useStore } from "../../../shared/store";
import type { Note } from "../../../shared/types";

const META: EntityMeta = { label: "Catatan", labelPlural: "Catatan" };

const COLUMNS: ColumnDef<Note>[] = [
  { key: "title", header: "Judul", width: "w-[32%]" },
  { key: "tags", header: "Tag", width: "w-[28%]" },
  {
    key: "linkedDocIds",
    header: "Link",
    width: "w-[14%]",
    render: (v) => (Array.isArray(v) ? v.length : 0) + " doc",
  },
  {
    key: "updatedAt",
    header: "Diperbarui",
    width: "w-[18%]",
    render: (v) =>
      typeof v === "number" ? new Date(v).toLocaleDateString() : "",
  },
];

export function useNotesController(): CrudController<Note> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.notes,
      getId: (n) => n.id,
      blank: () => ({
        id: `note-${Date.now().toString(36)}`,
        title: "Catatan baru",
        body: "",
        tags: [],
        linkedDocIds: [],
        updatedAt: Date.now(),
      }),
      create: (note) => dispatch({ type: "note.upsert", note }),
      update: (id, patch) => {
        const cur = state.notes.find((n) => n.id === id);
        if (!cur) return;
        dispatch({
          type: "note.upsert",
          note: { ...cur, ...patch, id, updatedAt: Date.now() },
        });
      },
      remove: (id) => dispatch({ type: "note.delete", id }),
    }),
    [state.notes, dispatch],
  );
}

export function NotesView() {
  const controller = useNotesController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/notes/${id}`}
      description="Catatan dengan backlinks dan concept map."
    />
  );
}
