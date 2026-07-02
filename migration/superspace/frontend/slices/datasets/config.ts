import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * Datasets — generic, schema-driven data containers for any business.
 *
 * Wraps the convex/features/datasets framework: workspace owners define
 * dataset types, create dataset instances, and feed records via UI / ETL
 * / external API push / remote pull. Slices that previously needed their
 * own qsr*-style tables can read from a dataset of the matching preset.
 */
/* @dod:skip-agent reason="AI schema-mapping deferred; stub until datasets AI lands" */
export default defineFeature({
  id: "datasets",
  name: "Datasets",
  description: "Generic data containers — define schema once, ingest from any business or remote source.",

  ui: {
    icon: "Table2",
    path: "/dashboard/datasets",
    component: "DatasetsPage",
    category: "administration",
    order: 26,
  },

  technical: {
    featureType: "optional",
    hasUI: true,
    hasConvex: true,
    hasTests: false,
    version: "0.1.0",
  },

  status: {
    state: "beta",
    isReady: true,
    expectedRelease: undefined,
  },

  generation: {
    mode: "full-json",
  },

  bundles: {
    core: [],
    recommended: ["fnb", "business-pro"],
    optional: ["custom"],
  },

  tags: ["data", "sync", "integration", "etl"],

  permissions: [
    "datasets.view",
    "datasets.manage",
  ],
})
