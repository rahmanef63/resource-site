"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./PerformanceEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { PerformanceMetric } from "../../../shared/types";

const META: EntityMeta = { label: "Metric", labelPlural: "Performance Metrics" };

const COLUMNS: ColumnDef<PerformanceMetric>[] = [
  { key: "channel", header: "Channel", width: "w-[18%]", badge: "outline" },
  { key: "period", header: "Period", width: "w-[16%]" },
  {
    key: "views",
    header: "Views",
    width: "w-[18%]",
    render: (v) => Number(v ?? 0).toLocaleString(),
  },
  {
    key: "followers",
    header: "Followers",
    width: "w-[18%]",
    render: (v) => Number(v ?? 0).toLocaleString(),
  },
  {
    key: "engagementRate",
    header: "Engagement",
    width: "w-[16%]",
    render: (v) => `${Number(v ?? 0).toFixed(1)}%`,
  },
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

export function PerformanceView() {
  const controller = usePerformanceController();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/performance/${id}`}
      description="Cross-channel analytics"
    />
  );
}
