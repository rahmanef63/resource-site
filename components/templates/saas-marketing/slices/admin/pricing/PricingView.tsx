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
import type { PricingTier } from "../../../shared/types";

const META: EntityMeta = {
  label: "Tier",
  labelPlural: "Pricing",
  publicHref: () => `${PUBLIC_BASE}/pricing`,
};

const COLUMNS: ColumnDef<PricingTier>[] = [
  { key: "name", header: "Name", width: "w-[22%]" },
  { key: "price", header: "Price", width: "w-[14%]", mono: true },
  { key: "period", header: "Period", width: "w-[16%]" },
  { key: "blurb", header: "Blurb", width: "w-[34%]" },
  {
    key: "featured",
    header: "Featured",
    width: "w-[10%]",
    render: (v) => (v ? "yes" : "—"),
  },
];

function usePricingController(): CrudController<PricingTier> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.pricing,
      getId: (t) => t.id,
      blank: () => ({
        id: `tier-${Math.random().toString(36).slice(2, 10)}`,
        name: "New tier",
        price: "$0",
        period: "per month",
        blurb: "",
        bullets: [],
        cta: { label: "Start", href: `${PUBLIC_BASE}/contact` },
        featured: false,
      }),
      create: (t) => dispatch({ type: "PRICING_UPSERT", payload: t }),
      update: (id, patch) =>
        dispatch({
          type: "PRICING_UPSERT",
          payload: { ...state.pricing.find((x) => x.id === id)!, ...patch, id },
        }),
      remove: (id) => dispatch({ type: "PRICING_DELETE", payload: { id } }),
    }),
    [state.pricing, dispatch],
  );
}

export function PricingView() {
  const controller = usePricingController();
  const featured = controller.items.filter((t) => t.featured).length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      editPath={(id) => `${ADMIN_BASE}/pricing/${id}`}
      description={`${featured} featured`}
    />
  );
}
