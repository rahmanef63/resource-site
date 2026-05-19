"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type {
  CrudController,
  ColumnDef,
  EntityMeta,
  FieldDef,
} from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import type { Snippet, SnippetKind } from "../../../shared/types";
import { ADMIN_BASE } from "../../../shared/nav-config";

const META: EntityMeta = {
  label: "Snippet",
  labelPlural: "Snippets",
};

const KIND_OPTIONS: { value: SnippetKind; label: string }[] = [
  { value: "equation", label: "Equation (KaTeX)" },
  { value: "code", label: "Code (highlight.js)" },
  { value: "text", label: "Plain text" },
  { value: "grid", label: "Grid (drag-fill)" },
];

export const COLUMNS: ColumnDef<Snippet>[] = [
  { key: "title", header: "Title", width: "w-[34%]" },
  {
    key: "kind",
    header: "Kind",
    width: "w-[18%]",
    render: (v) => KIND_OPTIONS.find((k) => k.value === v)?.label ?? String(v),
  },
  { key: "order", header: "Order", width: "w-[10%]" },
  {
    key: "published",
    header: "Status",
    width: "w-[14%]",
    render: (v) => (v ? "Published" : "Draft"),
  },
];

export const FIELDS: FieldDef<Snippet>[] = [
  { kind: "text", key: "title", label: "Title", wide: true },
  { kind: "select", key: "kind", label: "Kind", options: KIND_OPTIONS, hint: "Each kind renders via a different notion-blocks primitive on the public page." },
  {
    kind: "textarea",
    key: "body",
    label: "Body",
    rows: 6,
    mono: true,
    hint: "equation: raw LaTeX (e.g. \\int e^{-x^2} dx). code: source. text: paragraph. grid: JSON array.",
  },
  { kind: "text", key: "lang", label: "Language (code only)", placeholder: "typescript / bash / python / ...", hint: "Used only when kind=code." },
  { kind: "number", key: "order", label: "Order", min: 0, step: 1 },
  { kind: "switch", key: "published", label: "Published" },
];

function useSnippetsController(): CrudController<Snippet> {
  const { state, dispatch } = useStore();
  return {
    items: state.snippets,
    getId: (s) => s.id,
    blank: () => ({
      id: `sn-${Date.now()}`,
      kind: "text",
      title: "Untitled snippet",
      body: "",
      order: (state.snippets.at(-1)?.order ?? 0) + 1,
      published: false,
    }),
    create: (snippet) => dispatch({ type: "snippet.upsert", snippet }),
    update: (id, patch) => {
      const current = state.snippets.find((s) => s.id === id);
      if (!current) return;
      dispatch({ type: "snippet.upsert", snippet: { ...current, ...patch, id } });
    },
    remove: (id) => dispatch({ type: "snippet.delete", id }),
  };
}

export function SnippetsView() {
  const controller = useSnippetsController();
  const draftCount = controller.items.filter((s) => !s.published).length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/snippets/${id}`}
      description={draftCount ? `${draftCount} draft` : "All published"}
    />
  );
}
