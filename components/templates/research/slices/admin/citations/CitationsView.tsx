"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./CitationEditorView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE } from "../../../shared/nav-config";
import { useStore } from "../../../shared/store";
import type { Citation } from "../../../shared/types";

const META: EntityMeta = { label: "Sitasi", labelPlural: "Sitasi" };

const COLUMNS: ColumnDef<Citation>[] = [
  { key: "bibKey", header: "Bib Key", width: "w-[16%]", mono: true },
  { key: "style", header: "Style", width: "w-[10%]", badge: "outline" },
  { key: "rendered", header: "Rendered", width: "w-[48%]", mono: true },
  { key: "docId", header: "Doc ID", width: "w-[12%]", mono: true },
];

export function useCitationsController(): CrudController<Citation> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.citations,
      getId: (c) => c.id,
      blank: () => ({
        id: `cite-${Date.now().toString(36)}`,
        docId: "",
        style: "APA" as const,
        rendered: "",
        bibKey: `key${Date.now().toString(36)}`,
        addedAt: Date.now(),
      }),
      create: (citation) => dispatch({ type: "citation.upsert", citation }),
      update: (id, patch) => {
        const cur = state.citations.find((c) => c.id === id);
        if (!cur) return;
        dispatch({
          type: "citation.upsert",
          citation: { ...cur, ...patch, id },
        });
      },
      remove: (id) => dispatch({ type: "citation.delete", id }),
    }),
    [state.citations, dispatch],
  );
}

export function CitationsView() {
  const controller = useCitationsController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/citations/${id}`}
      description="APA, MLA, Chicago, IEEE, BibTeX — semua style siap export."
    />
  );
}
