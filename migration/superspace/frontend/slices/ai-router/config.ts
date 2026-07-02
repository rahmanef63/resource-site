import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * `ai-router` — provider-proxy config UI for tier-routed LLM access (vendored
 * from rr `ai-router`). Surfaces the nano / mid / flagship routing tiers that
 * the relocated convex action (`api.features.aiRouter.action.callModel`) proxies
 * through OpenRouter.
 *
 * SCAFFOLDED NON-FUNCTIONAL: adopted alongside the untouched first-party AI
 * engine (`convex/features/ai`). rr's ai-router convex was relocated to
 * `convex/features/aiRouter`. The UI renders inert (no live provider/SDK calls)
 * until a supervised follow-up wires the action with ensureUser +
 * requirePermission + logAuditEvent + workspace-scoped usage logging.
 */
const aiRouterConfig = defineFeature({
  id: "ai-router",
  name: "AI Router",
  description:
    "Provider-proxy config UI untuk akses LLM ber-tier — nano (Haiku) untuk klasifikasi, mid (Sonnet) untuk chat, flagship (Opus) untuk reasoning. Non-functional scaffold.",

  ui: {
    icon: "Waypoints",
    path: "/dashboard/ai-router",
    component: "AiRouterPage",
    category: "productivity",
    order: 116,
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
  },

  permissions: [
    "ai-router.view",
    "ai-router.manage",
  ],

  bundles: {
    core: [],
    recommended: [],
    optional: ["custom"],
  },

  tags: ["ai", "llm", "openrouter", "tier-routing"],
})

export default aiRouterConfig
export { aiRouterConfig }
