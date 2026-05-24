"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Supplier } from "../../../shared/types";
import { useSuppliersController } from "./SuppliersListView";

const META: EntityMeta = { label: "Supplier", labelPlural: "Suppliers" };

export const FIELDS: FieldDef<Supplier>[] = [
  { kind: "text", key: "name", label: "Nama supplier", wide: true },
  { kind: "text", key: "contactPerson", label: "PIC" },
  { kind: "text", key: "phone", label: "Telepon", mono: true, placeholder: "+62 812-..." },
  { kind: "text", key: "city", label: "Kota" },
  {
    kind: "select",
    key: "category",
    label: "Kategori",
    options: [
      { value: "Bahan baku", label: "Bahan baku" },
      { value: "Kemasan", label: "Kemasan" },
      { value: "Logistik", label: "Logistik" },
      { value: "Jasa", label: "Jasa" },
      { value: "Lainnya", label: "Lainnya" },
    ],
  },
  { kind: "number", key: "leadTimeDays", label: "Lead time (hari)", min: 0 },
  {
    kind: "select",
    key: "terms",
    label: "Term pembayaran",
    options: [
      { value: "COD", label: "COD" },
      { value: "Cash", label: "Cash" },
      { value: "Net 7", label: "Net 7" },
      { value: "Net 14", label: "Net 14" },
      { value: "Net 30", label: "Net 30" },
    ],
  },
  {
    kind: "tags",
    key: "linkedSkus",
    label: "SKU yang disuplai",
    hint: "Tekan Enter untuk tambah SKU. Cocokkan dengan SKU di Inventory.",
  },
  { kind: "textarea", key: "note", label: "Catatan", rows: 3 },
];

export function SupplierEditorView({ id }: { id: string }) {
  const controller = useSuppliersController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/suppliers`}
    />
  );
}
