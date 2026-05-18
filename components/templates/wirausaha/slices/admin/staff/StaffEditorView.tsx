"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { StaffMember } from "../../../shared/types";
import { useStaffController } from "./StaffView";

const META: EntityMeta = { label: "Staff", labelPlural: "Staff" };

function useFields(): FieldDef<StaffMember>[] {
  const { state } = useStore();
  return React.useMemo<FieldDef<StaffMember>[]>(
    () => [
      { kind: "text", key: "name", label: "Nama" },
      { kind: "text", key: "role", label: "Role", placeholder: "Kasir / Barista / Kurir / ..." },
      { kind: "text", key: "phone", label: "Telepon", mono: true, placeholder: "+62 812-..." },
      {
        kind: "select",
        key: "businessId",
        label: "Unit usaha",
        options: state.businesses.map((b) => ({ value: b.id, label: b.name })),
      },
      { kind: "date", key: "joinedAt", label: "Tanggal gabung" },
    ],
    [state.businesses],
  );
}

export function StaffEditorView({ id }: { id: string }) {
  const controller = useStaffController();
  const fields = useFields();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={fields}
      backHref={`${ADMIN_BASE}/staff`}
    />
  );
}
