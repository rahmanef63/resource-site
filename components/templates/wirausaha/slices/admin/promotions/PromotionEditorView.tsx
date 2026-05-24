"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Promotion } from "../../../shared/types";
import { usePromotionsController } from "./PromotionsListView";

const META: EntityMeta = { label: "Promo", labelPlural: "Promotions" };

export function useFields(): FieldDef<Promotion>[] {
  const { state } = useStore();
  const categoryOptions = React.useMemo(() => {
    const set = new Set<string>();
    state.catalog.forEach((c) => set.add(c.category));
    return [{ value: "", label: "— Tanpa kategori —" }, ...Array.from(set).map((c) => ({ value: c, label: c }))];
  }, [state.catalog]);

  return React.useMemo<FieldDef<Promotion>[]>(
    () => [
      { kind: "text", key: "code", label: "Kode promo", mono: true, placeholder: "HEMAT10" },
      { kind: "text", key: "label", label: "Label promo", placeholder: "Diskon 10% kuliner" },
      {
        kind: "select",
        key: "kind",
        label: "Jenis diskon",
        options: [
          { value: "percent", label: "Persen (%)" },
          { value: "rupiah", label: "Rupiah (Rp)" },
        ],
      },
      { kind: "number", key: "value", label: "Nilai diskon", min: 0, hint: "Untuk %, isi 1–100. Untuk Rp, isi nominal." },
      { kind: "date", key: "startAt", label: "Mulai berlaku" },
      { kind: "date", key: "endAt", label: "Berakhir" },
      { kind: "number", key: "usageLimit", label: "Limit pemakaian", min: 0, hint: "0 = tanpa batas" },
      { kind: "number", key: "usedCount", label: "Sudah dipakai", min: 0 },
      { kind: "text", key: "targetSku", label: "Target SKU (opsional)", mono: true, placeholder: "KSG-01" },
      {
        kind: "select",
        key: "targetCategory",
        label: "Target kategori (opsional)",
        options: categoryOptions,
      },
      {
        kind: "select",
        key: "status",
        label: "Status",
        options: [
          { value: "active", label: "Active" },
          { value: "scheduled", label: "Scheduled" },
          { value: "paused", label: "Paused" },
          { value: "expired", label: "Expired" },
        ],
      },
    ],
    [categoryOptions],
  );
}

export function PromotionEditorView({ id }: { id: string }) {
  const controller = usePromotionsController();
  const fields = useFields();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={fields}
      backHref={`${ADMIN_BASE}/promotions`}
    />
  );
}
