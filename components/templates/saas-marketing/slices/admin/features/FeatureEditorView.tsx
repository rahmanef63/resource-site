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
import type { FeatureItem } from "../../../shared/types";

const META: EntityMeta = {
  label: "Feature",
  labelPlural: "Features",
  publicHref: () => `${PUBLIC_BASE}/features`,
};

const FIELDS: FieldDef<FeatureItem>[] = [
  { kind: "text", key: "title", label: "Title" },
  {
    kind: "text",
    key: "icon",
    label: "Icon (lucide name)",
    mono: true,
    placeholder: "Sparkles",
    hint: "Display-only label rendered above the title.",
  },
  { kind: "textarea", key: "blurb", label: "Blurb", rows: 3 },
];

function useFeaturesController(): CrudController<FeatureItem> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.features,
      getId: (f) => f.id,
      blank: () => ({
        id: `f-${Math.random().toString(36).slice(2, 10)}`,
        title: "New feature",
        blurb: "",
        icon: "Sparkles",
      }),
      create: (f) => dispatch({ type: "FEATURE_UPSERT", payload: f }),
      update: (id, patch) =>
        dispatch({
          type: "FEATURE_UPSERT",
          payload: { ...state.features.find((x) => x.id === id)!, ...patch, id },
        }),
      remove: (id) => dispatch({ type: "FEATURE_DELETE", payload: { id } }),
    }),
    [state.features, dispatch],
  );
}

export function FeatureEditorView({ id }: { id: string }) {
  const controller = useFeaturesController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/features`}
    />
  );
}
