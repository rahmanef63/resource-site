"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { Badge } from "@/components/ui/badge";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import type { LandingSection } from "../../../shared/types";

const META: EntityMeta = {
  label: "Section",
  labelPlural: "Landing sections",
  publicHref: () => `${PUBLIC_BASE}`,
};

const KIND_LABEL: Record<LandingSection["kind"], string> = {
  hero: "Hero",
  features: "Features",
  testimonials: "Testimonials",
  pricing: "Pricing",
  blog: "Blog",
  changelog: "Changelog",
  faq: "FAQ",
  cta: "CTA",
  custom: "Custom",
};

const COLUMNS: ColumnDef<LandingSection>[] = [
  {
    key: "order",
    header: "Order",
    width: "w-[8%]",
    mono: true,
    render: (v) => String(v ?? "—").padStart(2, "0"),
  },
  {
    key: "kind",
    header: "Kind",
    width: "w-[14%]",
    render: (v) => (
      <Badge variant="outline" className="capitalize">
        {KIND_LABEL[v as LandingSection["kind"]] ?? String(v)}
      </Badge>
    ),
  },
  { key: "title", header: "Title", width: "w-[32%]" },
  { key: "subtitle", header: "Subtitle", width: "w-[36%]" },
  {
    key: "enabled",
    header: "Visible",
    width: "w-[10%]",
    render: (v) =>
      v ? (
        <Badge variant="default" className="bg-emerald-500/20 text-emerald-300">
          on
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          off
        </Badge>
      ),
  },
];

function useLandingController(): CrudController<LandingSection> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: [...state.landingSections].sort((a, b) => a.order - b.order),
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

export function LandingView() {
  const controller = useLandingController();
  const enabled = controller.items.filter((s) => s.enabled).length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      editPath={(id) => `${ADMIN_BASE}/landing/${id}`}
      description={`${enabled}/${controller.items.length} sections visible`}
    />
  );
}
