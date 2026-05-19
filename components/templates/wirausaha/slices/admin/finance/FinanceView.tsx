"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { fmtDate, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { FinanceRecord } from "../../../shared/types";
import { useFields } from "./FinanceEditorView";

const META: EntityMeta = { label: "Catatan", labelPlural: "Finance" };

function useColumns(): ColumnDef<FinanceRecord>[] {
  const { state } = useStore();
  const bizMap = React.useMemo(
    () => new Map(state.businesses.map((b) => [b.id, b.name])),
    [state.businesses],
  );
  return React.useMemo<ColumnDef<FinanceRecord>[]>(
    () => [
      {
        key: "ts",
        header: "Tanggal",
        width: "w-[14%]",
        render: (v) => fmtDate(Number(v)),
      },
      { key: "kind", header: "Jenis", width: "w-[10%]", badge: "outline" },
      {
        key: "businessId",
        header: "Unit",
        width: "w-[20%]",
        render: (v) => bizMap.get(String(v)) ?? "—",
      },
      { key: "category", header: "Kategori", width: "w-[18%]" },
      { key: "amountLabel", header: "Jumlah", width: "w-[14%]" },
      { key: "note", header: "Catatan", width: "w-[20%]" },
    ],
    [bizMap],
  );
}

export function useFinanceController(): CrudController<FinanceRecord> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.finance,
      getId: (r) => r.id,
      blank: () => ({
        id: `fin-${Math.random().toString(36).slice(2, 10)}`,
        businessId: state.businesses[0]?.id ?? "",
        kind: "income",
        category: "Penjualan",
        amountLabel: "Rp 0",
        note: "",
        ts: Date.now(),
      }),
      create: (record) => dispatch({ type: "finance.upsert", record }),
      update: (id, patch) => {
        const cur = state.finance.find((r) => r.id === id);
        if (!cur) return;
        dispatch({ type: "finance.upsert", record: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "finance.delete", id }),
    }),
    [state.finance, state.businesses, dispatch],
  );
}

export function FinanceView() {
  const controller = useFinanceController();
  const columns = useColumns();
  const fields = useFields();
  const income = controller.items.filter((r) => r.kind === "income").length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={columns}
      fields={fields}
      editPath={(id) => `${ADMIN_BASE}/finance/${id}`}
      description={`${income} income`}
    />
  );
}
