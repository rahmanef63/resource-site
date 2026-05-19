"use client";

import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Customer } from "../../../shared/types";
import { useCustomersController } from "./CustomersView";

const META: EntityMeta = { label: "Pelanggan", labelPlural: "Customers" };

export const FIELDS: FieldDef<Customer>[] = [
  { kind: "text", key: "name", label: "Nama" },
  { kind: "text", key: "phone", label: "Telepon", mono: true, placeholder: "+62 812-..." },
  { kind: "text", key: "city", label: "Kota" },
  { kind: "text", key: "totalSpentLabel", label: "Total spent (label)", placeholder: "Rp 1.4jt" },
  { kind: "number", key: "orderCount", label: "Jumlah order", min: 0 },
];

export function CustomerEditorView({ id }: { id: string }) {
  const controller = useCustomersController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/customers`}
    />
  );
}
