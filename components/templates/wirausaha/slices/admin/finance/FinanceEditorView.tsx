"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { FinanceRecord } from "../../../shared/types";
import { useFinanceController } from "./FinanceView";

const META: EntityMeta = { label: "Catatan", labelPlural: "Finance" };

export function useFields(): FieldDef<FinanceRecord>[] {
  const { state } = useStore();
  return React.useMemo<FieldDef<FinanceRecord>[]>(
    () => [
      {
        kind: "select",
        key: "businessId",
        label: "Unit usaha",
        options: state.businesses.map((b) => ({ value: b.id, label: b.name })),
      },
      {
        kind: "select",
        key: "kind",
        label: "Jenis",
        options: [
          { value: "income", label: "Income" },
          { value: "expense", label: "Expense" },
        ],
      },
      { kind: "text", key: "category", label: "Kategori", placeholder: "Penjualan / Bahan baku / ..." },
      { kind: "text", key: "amountLabel", label: "Jumlah (label)", placeholder: "Rp 1.2jt" },
      { kind: "textarea", key: "note", label: "Catatan", rows: 3 },
      { kind: "date", key: "ts", label: "Tanggal" },
    ],
    [state.businesses],
  );
}

export function FinanceEditorView({ id }: { id: string }) {
  const controller = useFinanceController();
  const fields = useFields();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={fields}
      backHref={`${ADMIN_BASE}/finance`}
    />
  );
}
