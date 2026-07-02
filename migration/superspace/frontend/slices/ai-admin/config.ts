import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * `ai-admin` — central operator console for the whole AI stack (vendored from
 * rr via `rr add ai-admin`). Surfaces sub-tabs for Providers / Models /
 * Instructions / Skills / Tools / Agents.
 *
 * Status: non-functional scaffold (0.1.0). The page renders the tab shell +
 * empty-state placeholders only — no live provider/model wiring. The rr
 * convex backend (`convex/features/ai-admin`) was NOT vendored, so
 * `technical.hasConvex` is false; the existing engine at `convex/features/ai`
 * is left untouched. Real impl (RBAC-gated CRUD over aiRouter registries) is a
 * supervised sp-backend follow-up.
 *
 * Console-tab discovery constants live in `./sections` (re-exported by the
 * slice barrel `index.ts`).
 */
const aiAdminConfig = defineFeature({
  id: "ai-admin",
  name: "AI Admin",
  description:
    "Operator console for the AI stack — providers, model registry, instructions, skills, tools, and agent definitions.",

  ui: {
    icon: "SlidersHorizontal",
    path: "/dashboard/ai-admin",
    component: "AiAdminPage",
    category: "productivity",
    order: 120,
  },

  technical: {
    featureType: "optional",
    hasUI: true,
    hasConvex: false,
    hasTests: false,
    version: "0.1.0",
  },

  status: {
    state: "beta",
    isReady: true,
  },

  permissions: [
    "ai.manage_providers",
    "ai.manage_models",
    "ai.manage_instructions",
    "ai.manage_skills",
    "ai.manage_tools",
    "ai.manage_agents",
  ],

  bundles: {
    core: [],
    recommended: [],
    optional: ["custom"],
  },

  tags: ["ai", "admin", "providers", "models", "agents", "console"],
})

export default aiAdminConfig
export { aiAdminConfig }
