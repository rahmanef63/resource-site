"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Product } from "../../../shared/types";
import { useProductsController } from "./InventoryView";

const META: EntityMeta = { label: "Produk", labelPlural: "Inventory" };

function useFields(): FieldDef<Product>[] {
  const { state } = useStore();
  return React.useMemo<FieldDef<Product>[]>(
    () => [
      { kind: "text", key: "name", label: "Nama produk" },
      { kind: "text", key: "sku", label: "SKU", mono: true },
      {
        kind: "select",
        key: "businessId",
        label: "Unit usaha",
        options: state.businesses.map((b) => ({ value: b.id, label: b.name })),
      },
      { kind: "text", key: "priceLabel", label: "Harga (label)", placeholder: "Rp 25k" },
      { kind: "number", key: "stock", label: "Stok", min: 0 },
      {
        kind: "select",
        key: "unit",
        label: "Satuan",
        options: [
          { value: "pcs", label: "pcs" },
          { value: "kg", label: "kg" },
          { value: "porsi", label: "porsi" },
          { value: "liter", label: "liter" },
          { value: "box", label: "box" },
        ],
      },
    ],
    [state.businesses],
  );
}

export function ProductEditorView({ id }: { id: string }) {
  const controller = useProductsController();
  const fields = useFields();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={fields}
      backHref={`${ADMIN_BASE}/inventory`}
    />
  );
}
