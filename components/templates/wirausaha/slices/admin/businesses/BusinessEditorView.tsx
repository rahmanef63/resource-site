"use client";

import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Business } from "../../../shared/types";
import { useBusinessesController } from "./BusinessesView";

const META: EntityMeta = { label: "Bisnis", labelPlural: "Bisnis" };

const FIELDS: FieldDef<Business>[] = [
  { kind: "text", key: "name", label: "Nama unit" },
  {
    kind: "select",
    key: "type",
    label: "Jenis",
    options: [
      { value: "Kuliner", label: "Kuliner" },
      { value: "Retail", label: "Retail" },
      { value: "Jasa", label: "Jasa" },
      { value: "Lainnya", label: "Lainnya" },
    ],
  },
  { kind: "text", key: "city", label: "Kota" },
  { kind: "number", key: "staffCount", label: "Jumlah staff", min: 0 },
  {
    kind: "number",
    key: "monthlyRevenue",
    label: "Revenue bulanan (Rp)",
    min: 0,
    step: 100000,
  },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Aktif" },
      { value: "paused", label: "Dijeda" },
    ],
  },
];

export function BusinessEditorView({ id }: { id: string }) {
  const controller = useBusinessesController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/businesses`}
    />
  );
}
