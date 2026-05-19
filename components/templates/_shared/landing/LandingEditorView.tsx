"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type {
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { useLandingStore } from "./landing-context";
import { LANDING_FIELDS } from "./landing-fields";
import type { LandingSection } from "./types";

const META: EntityMeta = {
  label: "Section",
  labelPlural: "Landing sections",
};

export function LandingEditorView({ id }: { id: string }) {
  const store = useLandingStore();
  const controller = React.useMemo<CrudController<LandingSection>>(
    () => ({
      items: store.items,
      getId: (s) => s.id,
      blank: () => blankSection(store.items.at(-1)?.order ?? 0),
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
      fields={LANDING_FIELDS}
      backHref={`${store.adminBase}/landing`}
    />
  );
}

export function blankSection(lastOrder: number): LandingSection {
  return {
    id: `ls-${Math.random().toString(36).slice(2, 10)}`,
    order: lastOrder + 10,
    kind: "custom",
    title: "New section",
    subtitle: "",
    enabled: true,
    imageUrl: "",
    bgImageUrl: "",
    className: "",
    config: "",
  };
}
