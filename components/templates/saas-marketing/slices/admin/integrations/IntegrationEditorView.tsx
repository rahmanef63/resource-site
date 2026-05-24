"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type {
  CrudController,
  EntityMeta,
  FieldDef,
} from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { Integration } from "../../../shared/types";

const META: EntityMeta = { label: "Integration", labelPlural: "Integrations" };

const PROVIDER_OPTIONS: { value: Integration["provider"]; label: string }[] = [
  { value: "slack",     label: "Slack" },
  { value: "linear",    label: "Linear" },
  { value: "hubspot",   label: "HubSpot" },
  { value: "resend",    label: "Resend" },
  { value: "stripe",    label: "Stripe" },
  { value: "github",    label: "GitHub" },
  { value: "intercom",  label: "Intercom" },
  { value: "segment",   label: "Segment" },
];

const STATUS_OPTIONS: { value: Integration["status"]; label: string }[] = [
  { value: "connected",    label: "Connected" },
  { value: "disconnected", label: "Disconnected" },
  { value: "error",        label: "Error" },
];

export const FIELDS: FieldDef<Integration>[] = [
  { kind: "text", key: "label", label: "Label", placeholder: "Slack — #revenue" },
  {
    kind: "select",
    key: "provider",
    label: "Provider",
    options: PROVIDER_OPTIONS,
  },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: STATUS_OPTIONS,
  },
  {
    kind: "text",
    key: "webhookUrl",
    label: "Webhook URL",
    mono: true,
    wide: true,
    placeholder: "https://hooks.example.com/...",
    hint: "Endpoint our backend POSTs events to. Set on the provider side.",
  },
  {
    kind: "tags",
    key: "scopes",
    label: "Scopes",
    hint: "OAuth scopes or capability tokens. Comma-separated.",
  },
  {
    kind: "text",
    key: "secretHint",
    label: "Secret hint",
    mono: true,
    placeholder: "sk_live_***_3Az9",
    hint: "Masked tail of the active API key. Never store the full secret here.",
  },
  { kind: "date", key: "lastSyncAt", label: "Last sync" },
  {
    kind: "textarea",
    key: "notes",
    label: "Notes",
    rows: 3,
    hint: "Operator-facing reminders: rotation cadence, downstream effects, etc.",
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

export function IntegrationEditorView({ id }: { id: string }) {
  const controller = useIntegrationsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/integrations`}
    />
  );
}
