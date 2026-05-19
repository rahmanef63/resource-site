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
import type { LandingSection } from "../../../shared/types";

const META: EntityMeta = {
  label: "Section",
  labelPlural: "Landing sections",
  publicHref: () => `${PUBLIC_BASE}`,
};

const FIELDS: FieldDef<LandingSection>[] = [
  {
    kind: "select",
    key: "kind",
    label: "Kind",
    options: [
      { value: "hero", label: "Hero" },
      { value: "features", label: "Features grid" },
      { value: "testimonials", label: "Testimonials" },
      { value: "pricing", label: "Pricing tiers" },
      { value: "blog", label: "Blog cards" },
      { value: "changelog", label: "Changelog feed" },
      { value: "faq", label: "FAQ accordion" },
      { value: "cta", label: "Call-to-action" },
      { value: "custom", label: "Custom" },
    ],
  },
  { kind: "text", key: "title", label: "Title", placeholder: "Section heading" },
  { kind: "textarea", key: "subtitle", label: "Subtitle", rows: 2 },
  { kind: "number", key: "order", label: "Order", min: 0, step: 10, hint: "Lower numbers render first" } as FieldDef<LandingSection>,
  { kind: "switch", key: "enabled", label: "Visible on /" },
  { kind: "textarea", key: "config", label: "Config (JSON)", rows: 4, mono: true, placeholder: "{}" },
];

function useController(): CrudController<LandingSection> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.landingSections,
      getId: (s) => s.id,
      blank: () => ({
        id: `ls-${Math.random().toString(36).slice(2, 10)}`,
        order: (state.landingSections.at(-1)?.order ?? 0) + 10,
        kind: "custom",
        title: "New section",
        subtitle: "",
        enabled: true,
        config: "",
      }),
      create: (s) => dispatch({ type: "LANDING_UPSERT", payload: s }),
      update: (id, patch) => {
        const current = state.landingSections.find((x) => x.id === id);
        if (!current) return;
        dispatch({ type: "LANDING_UPSERT", payload: { ...current, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "LANDING_DELETE", payload: { id } }),
    }),
    [state.landingSections, dispatch],
  );
}

export function LandingEditorView({ id }: { id: string }) {
  const controller = useController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/landing`}
    />
  );
}
