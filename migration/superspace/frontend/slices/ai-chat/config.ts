import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * `ai-chat` — AI chat workbench (vendored from rr via `rr add ai-chat`).
 *
 * Adopted alongside the existing `ai` engine (`convex/features/ai`), which is
 * left UNTOUCHED. This slice ships as a NON-FUNCTIONAL scaffold: the rr
 * `aiChat` convex backend was NOT installed — only `aiRouter`
 * (`convex/features/aiRouter`) + `create_your_mcp` exist. The workbench view
 * renders a real chat surface that degrades to a "wire-me-up" notice; inject a
 * backend (e.g. `useAction(api.features.aiRouter.action.callModel)`) to make
 * replies live. Hence `hasConvex: false` — no aiChat convex module is present.
 */
const aiChatConfig = defineFeature({
  id: "ai-chat",
  name: "AI Chat",
  description:
    "Chat workbench ala Claude.ai / ChatGPT — kirim pesan ke asisten AI. Scaffold non-fungsional; sambungkan backend untuk balasan sungguhan.",

  ui: {
    icon: "BotMessageSquare",
    path: "/dashboard/ai-chat",
    component: "AiChatPage",
    category: "productivity",
    order: 118,
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
    "ai-chat.view",
    "ai-chat.use",
  ],

  bundles: {
    core: [],
    recommended: [],
    optional: ["custom"],
  },

  tags: ["ai", "chat", "assistant", "productivity"],
})

export default aiChatConfig
export { aiChatConfig }
