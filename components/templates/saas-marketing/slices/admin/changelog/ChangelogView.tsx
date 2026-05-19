"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./ChangelogEditorView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { fmtDate, useStore } from "../../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import type { ChangelogEntry } from "../../../shared/types";

const META: EntityMeta = {
  label: "Changelog entry",
  labelPlural: "Changelog",
  publicHref: () => `${PUBLIC_BASE}/changelog`,
};

const COLUMNS: ColumnDef<ChangelogEntry>[] = [
  { key: "version", header: "Version", width: "w-[12%]", mono: true },
  { key: "kind", header: "Kind", width: "w-[10%]", badge: "outline" },
  { key: "title", header: "Title", width: "w-[42%]" },
  {
    key: "date",
    header: "Date",
    width: "w-[18%]",
    render: (v) => <span className="tabular-nums">{fmtDate(Number(v))}</span>,
  },
];

function useChangelogController(): CrudController<ChangelogEntry> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.changelog,
      getId: (e) => e.id,
      blank: () => ({
        id: `cl-${Math.random().toString(36).slice(2, 10)}`,
        version: "v0.0.0",
        date: Date.now(),
        kind: "feature",
        title: "New entry",
        body: "",
      }),
      create: (e) => dispatch({ type: "CHANGELOG_UPSERT", payload: e }),
      update: (id, patch) =>
        dispatch({
          type: "CHANGELOG_UPSERT",
          payload: { ...state.changelog.find((x) => x.id === id)!, ...patch, id },
        }),
      remove: (id) => dispatch({ type: "CHANGELOG_DELETE", payload: { id } }),
    }),
    [state.changelog, dispatch],
  );
}

export function ChangelogView() {
  const controller = useChangelogController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/changelog/${id}`}
      description="published on the public site"
    />
  );
}
