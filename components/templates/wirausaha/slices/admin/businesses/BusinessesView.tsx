"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Business } from "../../../shared/types";

const META: EntityMeta = { label: "Bisnis", labelPlural: "Bisnis" };

const COLUMNS: ColumnDef<Business>[] = [
  { key: "name", header: "Nama unit", width: "w-[26%]" },
  { key: "type", header: "Jenis", width: "w-[14%]", badge: "outline" },
  { key: "city", header: "Kota", width: "w-[16%]" },
  { key: "staffCount", header: "Staff", width: "w-[10%]" },
  {
    key: "monthlyRevenue",
    header: "Revenue/bln",
    width: "w-[16%]",
    render: (v) => `Rp ${(Number(v) / 1_000_000).toFixed(1)}jt`,
  },
  { key: "status", header: "Status", width: "w-[10%]", badge: "secondary" },
];

export function useBusinessesController(): CrudController<Business> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.businesses,
      getId: (b) => b.id,
      blank: () => ({
        id: `biz-${Math.random().toString(36).slice(2, 10)}`,
        name: "Unit baru",
        type: "Kuliner",
        city: "",
        staffCount: 0,
        monthlyRevenue: 0,
        status: "active",
      }),
      create: (business) => dispatch({ type: "business.upsert", business }),
      update: (id, patch) => {
        const cur = state.businesses.find((b) => b.id === id);
        if (!cur) return;
        dispatch({ type: "business.upsert", business: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "business.delete", id }),
    }),
    [state.businesses, dispatch],
  );
}

export function BusinessesView() {
  const controller = useBusinessesController();
  const active = controller.items.filter((b) => b.status === "active").length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      editPath={(id) => `${ADMIN_BASE}/businesses/${id}`}
      description={`${active} aktif`}
    />
  );
}
