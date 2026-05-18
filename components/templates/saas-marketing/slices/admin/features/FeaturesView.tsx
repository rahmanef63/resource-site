"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import type { FeatureItem } from "../../../shared/types";

const META: EntityMeta = {
  label: "Feature",
  labelPlural: "Features",
  publicHref: () => `${PUBLIC_BASE}/features`,
};

const COLUMNS: ColumnDef<FeatureItem>[] = [
  { key: "title", header: "Title", width: "w-[28%]" },
  { key: "icon", header: "Icon", width: "w-[16%]", mono: true },
  { key: "blurb", header: "Blurb", width: "w-[52%]" },
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

export function FeaturesView() {
  const controller = useFeaturesController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      editPath={(id) => `${ADMIN_BASE}/features/${id}`}
      description="rendered on the public Features page"
    />
  );
}
