"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./SupplierEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Supplier } from "../../../shared/types";

const META: EntityMeta = { label: "Supplier", labelPlural: "Suppliers" };

const COLUMNS: ColumnDef<Supplier>[] = [
  { key: "name", header: "Nama", width: "w-[26%]" },
  { key: "contactPerson", header: "PIC", width: "w-[14%]", hideOnMobile: true },
  { key: "phone", header: "Telepon", width: "w-[16%]", mono: true, hideOnMobile: true },
  { key: "city", header: "Kota", width: "w-[12%]" },
  {
    key: "leadTimeDays",
    header: "Lead time",
    width: "w-[10%]",
    render: (v) => `${Number(v)} hari`,
  },
  { key: "terms", header: "Term", width: "w-[10%]", badge: "outline" },
  {
    key: "linkedSkus",
    header: "SKU",
    width: "w-[12%]",
    hideOnMobile: true,
    render: (v) => {
      const arr = Array.isArray(v) ? v : [];
      return arr.length === 0 ? "—" : `${arr.length} item`;
    },
  },
];

export function useSuppliersController(): CrudController<Supplier> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.suppliers,
      getId: (s) => s.id,
      blank: () => ({
        id: `sup-${Math.random().toString(36).slice(2, 10)}`,
        name: "Supplier baru",
        contactPerson: "",
        phone: "",
        city: "",
        leadTimeDays: 3,
        terms: "Net 14",
        category: "Bahan baku",
        linkedSkus: [],
        note: "",
      }),
      create: (supplier) => dispatch({ type: "supplier.upsert", supplier }),
      update: (id, patch) => {
        const cur = state.suppliers.find((s) => s.id === id);
        if (!cur) return;
        dispatch({ type: "supplier.upsert", supplier: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "supplier.delete", id }),
    }),
    [state.suppliers, dispatch],
  );
}

export function SuppliersListView() {
  const controller = useSuppliersController();
  const cities = new Set(controller.items.map((s) => s.city)).size;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/suppliers/${id}`}
      description={`${controller.items.length} supplier · ${cities} kota`}
    />
  );
}
