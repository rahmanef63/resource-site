"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { fmtDate, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { StaffMember } from "../../../shared/types";
import { useFields } from "./StaffEditorView";

const META: EntityMeta = { label: "Staff", labelPlural: "Staff" };

function useColumns(): ColumnDef<StaffMember>[] {
  const { state } = useStore();
  const bizMap = React.useMemo(
    () => new Map(state.businesses.map((b) => [b.id, b.name])),
    [state.businesses],
  );
  return React.useMemo<ColumnDef<StaffMember>[]>(
    () => [
      { key: "name", header: "Nama", width: "w-[24%]" },
      { key: "role", header: "Role", width: "w-[18%]", badge: "outline" },
      { key: "phone", header: "Telepon", width: "w-[20%]", mono: true },
      {
        key: "businessId",
        header: "Unit",
        width: "w-[20%]",
        render: (v) => bizMap.get(String(v)) ?? "—",
      },
      {
        key: "joinedAt",
        header: "Gabung",
        width: "w-[14%]",
        render: (v) => fmtDate(Number(v)),
      },
    ],
    [bizMap],
  );
}

export function useStaffController(): CrudController<StaffMember> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.staff,
      getId: (s) => s.id,
      blank: () => ({
        id: `staff-${Math.random().toString(36).slice(2, 10)}`,
        businessId: state.businesses[0]?.id ?? "",
        name: "Staff baru",
        role: "Kasir",
        phone: "",
        joinedAt: Date.now(),
      }),
      create: (member) => dispatch({ type: "staff.upsert", member }),
      update: (id, patch) => {
        const cur = state.staff.find((s) => s.id === id);
        if (!cur) return;
        dispatch({ type: "staff.upsert", member: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "staff.delete", id }),
    }),
    [state.staff, state.businesses, dispatch],
  );
}

export function StaffView() {
  const controller = useStaffController();
  const columns = useColumns();
  const fields = useFields();
  const units = new Set(controller.items.map((s) => s.businessId)).size;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={columns}
      fields={fields}
      editPath={(id) => `${ADMIN_BASE}/staff/${id}`}
      description={`${units} unit terisi`}
    />
  );
}
