"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type {
  CrudController,
  EntityMeta,
  FieldDef,
} from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import type { ChangelogEntry } from "../../../shared/types";

const META: EntityMeta = {
  label: "Changelog entry",
  labelPlural: "Changelog",
  publicHref: () => `${PUBLIC_BASE}/changelog`,
};

export const FIELDS: FieldDef<ChangelogEntry>[] = [
  { kind: "text", key: "version", label: "Version", mono: true, placeholder: "v1.0.0" },
  {
    kind: "select",
    key: "kind",
    label: "Kind",
    options: [
      { value: "feature", label: "Feature" },
      { value: "fix", label: "Fix" },
      { value: "chore", label: "Chore" },
    ],
  },
  { kind: "text", key: "title", label: "Title" },
  { kind: "textarea", key: "body", label: "Body", rows: 5 },
  { kind: "date", key: "date", label: "Date" },
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

export function ChangelogEditorView({ id }: { id: string }) {
  const controller = useChangelogController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/changelog`}
    />
  );
}
