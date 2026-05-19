"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type {
  CrudController,
  EntityMeta,
  FieldDef,
} from "@/components/templates/_shared/crud/types";
import { useLandingStore } from "./landing-context";
import type { LandingSection } from "./types";

const META: EntityMeta = {
  label: "Section",
  labelPlural: "Landing sections",
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
      { value: "portfolio", label: "Portfolio grid" },
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

export function LandingEditorView({ id }: { id: string }) {
  const store = useLandingStore();
  const controller = React.useMemo<CrudController<LandingSection>>(
    () => ({
      items: store.items,
      getId: (s) => s.id,
      blank: () => ({
        id: `ls-${Math.random().toString(36).slice(2, 10)}`,
        order: (store.items.at(-1)?.order ?? 0) + 10,
        kind: "custom",
        title: "New section",
        subtitle: "",
        enabled: true,
        config: "",
      }),
      create: store.create,
      update: store.update,
      remove: store.remove,
    }),
    [store],
  );
  return (
    <CrudFormView
      id={id}
      meta={{
        ...META,
        publicHref: () => store.publicBase,
      }}
      controller={controller}
      fields={FIELDS}
      backHref={`${store.adminBase}/landing`}
    />
  );
}
