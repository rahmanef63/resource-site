"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { CrudController, EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { PerformanceMetric } from "../../../shared/types";

const META: EntityMeta = { label: "Metric", labelPlural: "Performance Metrics" };

export const FIELDS: FieldDef<PerformanceMetric>[] = [
  {
    kind: "select",
    key: "channel",
    label: "Channel",
    options: [
      { value: "instagram", label: "Instagram" },
      { value: "tiktok", label: "TikTok" },
      { value: "youtube", label: "YouTube" },
      { value: "twitter", label: "Twitter" },
      { value: "newsletter", label: "Newsletter" },
      { value: "linkedin", label: "LinkedIn" },
    ],
  },
  { kind: "text", key: "period", label: "Period", placeholder: "Jan 2026" },
  { kind: "number", key: "views", label: "Views", min: 0 },
  { kind: "number", key: "followers", label: "Followers", min: 0 },
  { kind: "number", key: "engagementRate", label: "Engagement %", min: 0, max: 100, step: 0.1 },
];

function usePerformanceController(): CrudController<PerformanceMetric> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.performance,
      getId: (m) => m.id,
      blank: () => ({
        id: `pm-${Math.random().toString(36).slice(2, 10)}`,
        channel: "instagram",
        period: new Date().toLocaleString("en-US", { month: "short", year: "numeric" }),
        views: 0,
        followers: 0,
        engagementRate: 0,
      }),
      create: (metric) => dispatch({ type: "performance.upsert", metric }),
      update: (id, patch) => {
        const cur = state.performance.find((p) => p.id === id);
        if (!cur) return;
        dispatch({ type: "performance.upsert", metric: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "performance.delete", id }),
    }),
    [state.performance, dispatch],
  );
}

export function PerformanceEditorView({ id }: { id: string }) {
  const controller = usePerformanceController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/performance`}
    />
  );
}
