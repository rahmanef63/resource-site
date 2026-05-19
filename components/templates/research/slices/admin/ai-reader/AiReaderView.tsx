"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./AiReaderEditorView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE } from "../../../shared/nav-config";
import { useStore } from "../../../shared/store";
import type { AiReaderSession } from "../../../shared/types";

const META: EntityMeta = { label: "Sesi AI", labelPlural: "Sesi AI Reader" };

const COLUMNS: ColumnDef<AiReaderSession>[] = [
  { key: "question", header: "Pertanyaan", width: "w-[36%]" },
  { key: "docId", header: "Doc ID", width: "w-[16%]", mono: true },
  { key: "answer", header: "Jawaban", width: "w-[32%]" },
  {
    key: "ts",
    header: "Waktu",
    width: "w-[12%]",
    render: (v) =>
      typeof v === "number" ? new Date(v).toLocaleDateString() : "",
  },
];

export function useAiReaderController(): CrudController<AiReaderSession> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.aiReaderSessions,
      getId: (s) => s.id,
      blank: () => ({
        id: `ses-${Date.now().toString(36)}`,
        docId: "",
        question: "Pertanyaan baru",
        answer: "",
        ts: Date.now(),
      }),
      create: (session) => dispatch({ type: "aireader.upsert", session }),
      update: (id, patch) => {
        const cur = state.aiReaderSessions.find((s) => s.id === id);
        if (!cur) return;
        dispatch({
          type: "aireader.upsert",
          session: { ...cur, ...patch, id },
        });
      },
      remove: (id) => dispatch({ type: "aireader.delete", id }),
    }),
    [state.aiReaderSessions, dispatch],
  );
}

export function AiReaderView() {
  const controller = useAiReaderController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/ai-reader/${id}`}
      description="Tanya, parafrase, ringkas — AI selalu balik ke source-of-truth."
    />
  );
}
