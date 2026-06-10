/**
 * Slice contract for `ai-router` — Phase A.
 *
 * Tier-routed LLM access via OpenRouter (nano → Haiku, mid → Sonnet, flagship
 * → Opus) with a per-call usage log. Convex action lives at
 * `convex/features/ai/action.ts`; usage logged via internal mutation in
 * `convex/features/ai/mutation.ts`. The slice owns the `ai_router_*`
 * namespace per the 2026-05-12 prefix decision (consumer migration documented
 * in `slice.manifest.json` notes).
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "ai-router",
  version: "0.3.0",
  requires: {
    auth: "convex",
    rbac: ["ai.invoke", "ai.view-usage"],
    env: ["OPENROUTER_API_KEY"],
    convex: {
      prefix: "ai_router_",
      tables: ["ai_router_usage", "ai_router_calls"],
    },
    deps: ["convex-auth"],
  },
  provides: {
    tools: [
      "ai-router.route"
    ] as string[],
    tables: ["ai_router_usage", "ai_router_calls"],
    events: ["ai.invoked", "ai.usage.logged"],
  },
  generalization: {
    level: "needs-adapter",
  },
});
