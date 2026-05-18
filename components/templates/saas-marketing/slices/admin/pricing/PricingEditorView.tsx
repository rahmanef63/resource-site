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
import type { PricingTier } from "../../../shared/types";

const META: EntityMeta = {
  label: "Tier",
  labelPlural: "Pricing",
  publicHref: () => `${PUBLIC_BASE}/pricing`,
};

/** Flat view-model for the form (cta unrolled into 2 flat fields). */
type TierFlat = Omit<PricingTier, "cta"> & {
  ctaLabel: string;
  ctaHref: string;
};

const FIELDS: FieldDef<TierFlat>[] = [
  { kind: "text", key: "name", label: "Name" },
  { kind: "text", key: "price", label: "Price", mono: true, placeholder: "$49" },
  { kind: "text", key: "period", label: "Period", placeholder: "per month" },
  { kind: "textarea", key: "blurb", label: "Blurb", rows: 2 },
  { kind: "tags", key: "bullets", label: "Bullets (comma-separated)" },
  { kind: "text", key: "ctaLabel", label: "CTA label" },
  { kind: "text", key: "ctaHref", label: "CTA href", mono: true },
  { kind: "switch", key: "featured", label: "Featured" },
];

const toFlat = (t: PricingTier): TierFlat => ({
  id: t.id,
  name: t.name,
  price: t.price,
  period: t.period,
  blurb: t.blurb,
  bullets: t.bullets,
  featured: t.featured,
  ctaLabel: t.cta.label,
  ctaHref: t.cta.href,
});

const fromFlat = (f: TierFlat): PricingTier => ({
  id: f.id,
  name: f.name,
  price: f.price,
  period: f.period,
  blurb: f.blurb,
  bullets: f.bullets,
  featured: f.featured,
  cta: { label: f.ctaLabel, href: f.ctaHref },
});

function useController(): CrudController<TierFlat> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.pricing.map(toFlat),
      getId: (t) => t.id,
      blank: () =>
        toFlat({
          id: `tier-${Math.random().toString(36).slice(2, 10)}`,
          name: "New tier",
          price: "$0",
          period: "per month",
          blurb: "",
          bullets: [],
          cta: { label: "Start", href: `${PUBLIC_BASE}/contact` },
          featured: false,
        }),
      create: (t) => dispatch({ type: "PRICING_UPSERT", payload: fromFlat(t) }),
      update: (id, patch) => {
        const current = state.pricing.find((x) => x.id === id);
        if (!current) return;
        const merged = { ...toFlat(current), ...patch, id };
        dispatch({ type: "PRICING_UPSERT", payload: fromFlat(merged) });
      },
      remove: (id) => dispatch({ type: "PRICING_DELETE", payload: { id } }),
    }),
    [state.pricing, dispatch],
  );
}

export function PricingEditorView({ id }: { id: string }) {
  const controller = useController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/pricing`}
    />
  );
}
