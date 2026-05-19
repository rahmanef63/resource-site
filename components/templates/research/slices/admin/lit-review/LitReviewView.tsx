"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE } from "../../../shared/nav-config";
import { useStore } from "../../../shared/store";
import type { LitReview } from "../../../shared/types";
import { FIELDS } from "./LitReviewEditorView";

const META: EntityMeta = { label: "Review", labelPlural: "Literature Review" };

const COLUMNS: ColumnDef<LitReview>[] = [
  { key: "topic", header: "Topik", width: "w-[28%]" },
  { key: "question", header: "Pertanyaan riset", width: "w-[36%]" },
  {
    key: "docIds",
    header: "Doc",
    width: "w-[8%]",
    render: (v) => (Array.isArray(v) ? v.length : 0),
  },
  {
    key: "matrix",
    header: "Matrix",
    width: "w-[8%]",
    render: (v) => (Array.isArray(v) ? v.length : 0),
  },
  {
    key: "updatedAt",
    header: "Diperbarui",
    width: "w-[14%]",
    render: (v) =>
      typeof v === "number" ? new Date(v).toLocaleDateString() : "",
  },
];

export function useLitReviewController(): CrudController<LitReview> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.litReviews,
      getId: (l) => l.id,
      blank: () => ({
        id: `lit-${Date.now().toString(36)}`,
        topic: "Topik baru",
        question: "",
        docIds: [],
        matrix: [],
        updatedAt: Date.now(),
      }),
      create: (lit) => dispatch({ type: "litreview.upsert", lit }),
      update: (id, patch) => {
        const cur = state.litReviews.find((l) => l.id === id);
        if (!cur) return;
        dispatch({
          type: "litreview.upsert",
          lit: { ...cur, ...patch, id, updatedAt: Date.now() },
        });
      },
      remove: (id) => dispatch({ type: "litreview.delete", id }),
    }),
    [state.litReviews, dispatch],
  );
}

export function LitReviewView() {
  const controller = useLitReviewController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/lit-review/${id}`}
      description="Matrix bandingkan metode, temuan, dan gap antar paper."
    />
  );
}
