"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Promotion } from "../../../shared/types";
import { useFields } from "./PromotionEditorView";

const META: EntityMeta = { label: "Promo", labelPlural: "Promotions" };

const COLUMNS: ColumnDef<Promotion>[] = [
  { key: "code", header: "Kode", width: "w-[14%]", mono: true },
  { key: "label", header: "Label", width: "w-[28%]" },
  {
    key: "kind",
    header: "Jenis",
    width: "w-[10%]",
    render: (v) => (v === "percent" ? "%" : "Rp"),
  },
  {
    key: "value",
    header: "Nilai",
    width: "w-[12%]",
    render: (v, r) =>
      r.kind === "percent" ? `${Number(v)}%` : `Rp ${Number(v).toLocaleString("id-ID")}`,
  },
  {
    key: "usedCount",
    header: "Pakai",
    width: "w-[12%]",
    render: (v, r) => `${Number(v)} / ${r.usageLimit === 0 ? "∞" : r.usageLimit}`,
  },
  { key: "status", header: "Status", width: "w-[12%]", badge: "secondary" },
];

export function usePromotionsController(): CrudController<Promotion> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.promotions,
      getId: (p) => p.id,
      blank: () => ({
        id: `promo-${Math.random().toString(36).slice(2, 10)}`,
        code: "PROMO",
        label: "Promo baru",
        kind: "percent",
        value: 10,
        startAt: Date.now(),
        endAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        usageLimit: 0,
        usedCount: 0,
        status: "scheduled",
      }),
      create: (promotion) => dispatch({ type: "promotion.upsert", promotion }),
      update: (id, patch) => {
        const cur = state.promotions.find((p) => p.id === id);
        if (!cur) return;
        dispatch({ type: "promotion.upsert", promotion: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "promotion.delete", id }),
    }),
    [state.promotions, dispatch],
  );
}

export function PromotionsListView() {
  const controller = usePromotionsController();
  const fields = useFields();
  const active = controller.items.filter((p) => p.status === "active").length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={fields}
      editPath={(id) => `${ADMIN_BASE}/promotions/${id}`}
      description={`${active} promo aktif`}
    />
  );
}
