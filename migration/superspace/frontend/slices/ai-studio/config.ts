import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * `ai-studio` — AI generation canvas (vendored from rr via `rr add ai-studio`).
 * Single big prompt input → streaming output with variation grid + version
 * tree. Suno / Midjourney / Lovable pattern.
 *
 * Status: NON-FUNCTIONAL scaffold. The UI surface (`AiStudioPage`) renders but
 * does not run real generations — the provider/SDK call is stubbed. The rr
 * `ai-router` backend was relocated to `convex/features/aiRouter`; wiring the
 * canvas to `api.features.aiRouter` (+ ensureUser + requirePermission +
 * logAuditEvent + a by_workspace index) is a supervised sp-backend follow-up.
 * The existing `convex/features/ai` engine is intentionally left UNTOUCHED.
 */
const aiStudioConfig = defineFeature({
  id: "ai-studio",
  name: "AI Studio",
  description:
    "Kanvas generasi AI — satu prompt besar menghasilkan output streaming dengan grid variasi dan pohon versi (pola Suno / Midjourney / Lovable).",

  ui: {
    icon: "WandSparkles",
    path: "/dashboard/ai-studio",
    component: "AiStudioPage",
    category: "creativity",
    order: 116,
  },

  technical: {
    featureType: "optional",
    hasUI: true,
    hasConvex: false,
    hasTests: false,
    version: "0.1.0",
  },

  // Scaffold: canvas UI renders; real generation is stubbed (see file header).
  status: {
    state: "beta",
    isReady: true,
  },

  permissions: [
    "ai-studio.view",
    "ai-studio.generate",
  ],

  bundles: {
    core: [],
    recommended: [],
    optional: ["custom"],
  },

  tags: ["ai", "studio", "generation", "streaming", "creativity"],
})

export default aiStudioConfig
export { aiStudioConfig }
