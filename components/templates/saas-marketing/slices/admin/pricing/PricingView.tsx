"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type {
  ColumnDef,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import { FIELDS, useTierFlatController, type TierFlat } from "./PricingEditorView";

const META: EntityMeta = {
  label: "Tier",
  labelPlural: "Pricing",
  publicHref: () => `${PUBLIC_BASE}/pricing`,
};

const COLUMNS: ColumnDef<TierFlat>[] = [
  { key: "name", header: "Name", width: "w-[22%]" },
  { key: "price", header: "Price", width: "w-[14%]", mono: true },
  { key: "period", header: "Period", width: "w-[16%]", hideOnMobile: true },
  { key: "blurb", header: "Blurb", width: "w-[34%]", hideOnMobile: true },
  {
    key: "featured",
    header: "Featured",
    width: "w-[10%]",
    render: (v) => (v ? "yes" : "—"),
  },
];

export function PricingView() {
  const controller = useTierFlatController();
  const featured = controller.items.filter((t) => t.featured).length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/pricing/${id}`}
      description={`${featured} featured`}
    />
  );
}
