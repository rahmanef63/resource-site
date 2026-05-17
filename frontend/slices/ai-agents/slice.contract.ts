/**
 * Slice contract for `ai-agents` — v0.1.0.
 *
 * Autonomous background agents — task queue + per-run trace dashboard
 * (Devin / Replit-Agent pattern). Each run writes an audit-log entry,
 * cost tally, and shareable trace URL. Reads model/tool registries from
 * the `ai-admin` slice.
 *
 * Convex tables: aiAgentsTables (see `convex/features/ai-agents/schema.ts`).
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "ai-agents",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["agents.read", "agents.write"],
    env: [],
    deps: ["convex-auth", "ai-router", "ai-admin", "audit-log"],
  },
  provides: {
    components: ["AgentsView", "AgentRunTrace", "AgentQueue"],
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
