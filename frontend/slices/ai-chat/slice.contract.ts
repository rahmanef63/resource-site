/**
 * Slice contract for `ai-chat` — v0.1.0.
 *
 * Claude.ai / ChatGPT-style chatbot. Three-column shell with multi-provider
 * routing, multimodal inputs, typed tool calls, agent mode, branching
 * threads, RAG citations, resumable streams. Reads provider/model/tool/skill
 * registries from `ai-admin`; routes calls via `ai-router`.
 *
 * Convex tables: aiChatTables (see `convex/features/ai-chat/_schema.ts`).
 * Provider keys live in Convex env: ANTHROPIC_API_KEY / OPENAI_API_KEY /
 * GOOGLE_GENERATIVE_AI_API_KEY (any subset — ai-router picks the available).
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "ai-chat",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["chat.read", "chat.write"],
    env: [
      "ANTHROPIC_API_KEY",
      "OPENAI_API_KEY",
      "GOOGLE_GENERATIVE_AI_API_KEY",
    ],
    deps: ["convex-auth", "ai-router", "ai-admin", "vector-search"],
  },
  provides: {
    components: [
      "ChatWorkbench",
      "ChatThreadSidebar",
      "ChatModelPicker",
      "ChatMessageList",
    ],
  },
  conflicts: [],
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "portable",
      forbiddenTerms: ["rahmanef", "rahmanef.com"],
      requiredProps: [],
    },
  },
});
