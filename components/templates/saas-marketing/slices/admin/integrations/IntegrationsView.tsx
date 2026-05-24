"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { Badge } from "@/components/ui/badge";
import { FIELDS } from "./IntegrationEditorView";
import type {
  ColumnDef,
  CrudController,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { fmtDate, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Integration, IntegrationStatus } from "../../../shared/types";

const META: EntityMeta = { label: "Integration", labelPlural: "Integrations" };

const STATUS_LABEL: Record<IntegrationStatus, { tone: "default" | "outline" | "secondary"; text: string }> = {
  connected:    { tone: "default",   text: "Connected" },
  disconnected: { tone: "outline",   text: "Disconnected" },
  error:        { tone: "secondary", text: "Error" },
};

const COLUMNS: ColumnDef<Integration>[] = [
  { key: "label",    header: "Label", width: "w-[24%]" },
  { key: "provider", header: "Provider", width: "w-[12%]", badge: "outline" },
  {
    key: "status",
    header: "Status",
    width: "w-[14%]",
    render: (v) => {
      const s = STATUS_LABEL[v as IntegrationStatus];
      return <Badge variant={s.tone} className="rounded-full text-[10px]">{s.text}</Badge>;
    },
  },
  {
    key: "scopes",
    header: "Scopes",
    width: "w-[22%]",
    hideOnMobile: true,
    render: (v) => {
      const arr = (v as string[]) ?? [];
      return (
        <span className="font-mono text-[11px] text-muted-foreground">
          {arr.length ? arr.slice(0, 3).join(", ") + (arr.length > 3 ? ` +${arr.length - 3}` : "") : "—"}
        </span>
      );
    },
  },
  {
    key: "secretHint",
    header: "Key",
    width: "w-[14%]",
    mono: true,
    hideOnMobile: true,
    render: (v) => (
      <span className="font-mono text-[11px] text-muted-foreground">{(v as string) || "—"}</span>
    ),
  },
  {
    key: "lastSyncAt",
    header: "Last sync",
    width: "w-[14%]",
    render: (v) => <span className="tabular-nums">{fmtDate(Number(v))}</span>,
  },
];

function useIntegrationsController(): CrudController<Integration> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.integrations,
      getId: (i) => i.id,
      blank: () => ({
        id: `int-${Math.random().toString(36).slice(2, 10)}`,
        provider: "slack",
        label: "New integration",
        status: "disconnected",
        webhookUrl: "",
        scopes: [],
        lastSyncAt: Date.now(),
        secretHint: "",
        notes: "",
      }),
      create: (i) => dispatch({ type: "INTEGRATION_UPSERT", payload: i }),
      update: (id, patch) =>
        dispatch({
          type: "INTEGRATION_UPSERT",
          payload: { ...state.integrations.find((x) => x.id === id)!, ...patch, id },
        }),
      remove: (id) => dispatch({ type: "INTEGRATION_DELETE", payload: { id } }),
    }),
    [state.integrations, dispatch],
  );
}

export function IntegrationsView() {
  const controller = useIntegrationsController();
  const live = controller.items.filter((i) => i.status === "connected").length;
  const broken = controller.items.filter((i) => i.status === "error").length;
  const description =
    `${live} connected` + (broken ? ` · ${broken} need attention` : "");
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/integrations/${id}`}
      description={description}
    />
  );
}
