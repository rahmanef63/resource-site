import { defineFeature } from "@/frontend/shared/lib/features/defineFeature";

/**
 * `ai-agents` — Autonomous AI worker dashboard (vendored from rr `ai-agents`).
 *
 * NON-FUNCTIONAL SCAFFOLD adopted ALONGSIDE the existing AI engine
 * (`convex/features/ai`, which stays UNTOUCHED). rr's `ai-router` convex was
 * relocated to `convex/features/aiRouter`; this slice ships NO live convex
 * wiring (`hasConvex: false`). The runner's shared function-calling loop
 * (`@/shared/agentic`, absent in superspace) is stubbed locally in `runner.ts`
 * so the slice type-checks. The UI (`views/AiAgentsPage.tsx`) renders a static
 * task-queue + run-trace dashboard — no provider/SDK call is made.
 */
const aiAgentsConfig = defineFeature({
  id: "ai-agents",
  name: "AI Agents",
  description:
    "Dashboard pekerja AI otonom — antrean task + jejak langkah per run (gaya Devin/Replit-Agent). Scaffold non-fungsional.",

  ui: {
    icon: "Workflow",
    path: "/dashboard/ai-agents",
    component: "AiAgentsPage",
    category: "productivity",
    order: 116,
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

  permissions: ["ai-agents.view", "ai-agents.manage"],

  bundles: {
    core: [],
    recommended: [],
    optional: ["custom"],
  },

  tags: ["ai", "agent", "autonomous", "queue", "traces"],
});

export default aiAgentsConfig;
export { aiAgentsConfig };
