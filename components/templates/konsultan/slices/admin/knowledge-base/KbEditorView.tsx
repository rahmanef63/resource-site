"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { CrudController, EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { KbArticle } from "../../../shared/types";

const META: EntityMeta = { label: "Article", labelPlural: "Knowledge Base" };

export const FIELDS: FieldDef<KbArticle>[] = [
  { kind: "text", key: "title", label: "Judul" },
  { kind: "text", key: "slug", label: "Slug", mono: true },
  {
    kind: "select",
    key: "category",
    label: "Kategori",
    options: [
      { value: "Strategi", label: "Strategi" },
      { value: "Operasi", label: "Operasi" },
      { value: "Organisasi", label: "Organisasi" },
      { value: "M&A", label: "M&A" },
      { value: "Workshop", label: "Workshop" },
      { value: "Template", label: "Template" },
    ],
  },
  { kind: "textarea", key: "summary", label: "Ringkasan (1–2 kalimat)", rows: 3 },
  {
    kind: "textarea",
    key: "body",
    label: "Isi (paragraf dipisah baris kosong)",
    rows: 12,
    hint: "Markdown ringan. Paragraf baru = enter dua kali.",
  },
  { kind: "text", key: "author", label: "Penulis" },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ],
  },
  { kind: "date", key: "updatedAt", label: "Updated At" },
];

function useKbController(): CrudController<KbArticle> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.kbArticles,
      getId: (a) => a.id,
      blank: () => ({
        id: `kb-${Math.random().toString(36).slice(2, 10)}`,
        slug: `playbook-${Math.random().toString(36).slice(2, 6)}`,
        title: "Playbook baru",
        category: "Strategi",
        summary: "Ringkasan singkat playbook ini.",
        body: "Paragraf pertama playbook.",
        author: "Lorem Konsultan",
        updatedAt: Date.now(),
        status: "draft",
      }),
      create: (article) => dispatch({ type: "kb.upsert", article }),
      update: (id, patch) => {
        const cur = state.kbArticles.find((a) => a.id === id);
        if (!cur) return;
        dispatch({
          type: "kb.upsert",
          article: { ...cur, ...patch, id, updatedAt: Date.now() },
        });
      },
      remove: (id) => dispatch({ type: "kb.delete", id }),
    }),
    [state.kbArticles, dispatch],
  );
}

export function KbEditorView({ id }: { id: string }) {
  const controller = useKbController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/knowledge-base`}
    />
  );
}
