"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Product } from "../../../shared/types";

const META: EntityMeta = { label: "Produk", labelPlural: "Inventory" };

function useColumns(): ColumnDef<Product>[] {
  const { state } = useStore();
  const bizMap = React.useMemo(
    () => new Map(state.businesses.map((b) => [b.id, b.name])),
    [state.businesses],
  );
  return React.useMemo<ColumnDef<Product>[]>(
    () => [
      { key: "name", header: "Produk", width: "w-[28%]" },
      { key: "sku", header: "SKU", width: "w-[14%]", mono: true },
      {
        key: "businessId",
        header: "Unit usaha",
        width: "w-[20%]",
        render: (v) => bizMap.get(String(v)) ?? "—",
      },
      { key: "priceLabel", header: "Harga", width: "w-[12%]" },
      {
        key: "stock",
        header: "Stok",
        width: "w-[12%]",
        render: (v, r) => `${Number(v)} ${r.unit}`,
      },
    ],
    [bizMap],
  );
}

export function useProductsController(): CrudController<Product> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.products,
      getId: (p) => p.id,
      blank: () => ({
        id: `p-${Math.random().toString(36).slice(2, 10)}`,
        businessId: state.businesses[0]?.id ?? "",
        name: "Produk baru",
        sku: "",
        priceLabel: "Rp 0",
        stock: 0,
        unit: "pcs",
      }),
      create: (product) => dispatch({ type: "product.upsert", product }),
      update: (id, patch) => {
        const cur = state.products.find((p) => p.id === id);
        if (!cur) return;
        dispatch({ type: "product.upsert", product: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "product.delete", id }),
    }),
    [state.products, state.businesses, dispatch],
  );
}

export function InventoryView() {
  const controller = useProductsController();
  const columns = useColumns();
  const lowStock = controller.items.filter((p) => p.stock < 20).length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={columns}
      editPath={(id) => `${ADMIN_BASE}/inventory/${id}`}
      description={`${lowStock} stok menipis`}
    />
  );
}
