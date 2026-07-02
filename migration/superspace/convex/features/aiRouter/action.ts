import { action } from "../../_generated/server";
import { v } from "convex/values";

const TIER_TO_MODEL = {
  nano: "anthropic/claude-haiku-4-5",
  mid: "anthropic/claude-sonnet-4-6",
  flagship: "anthropic/claude-opus-4-7",
} as const;

/**
 * SCAFFOLDED NON-FUNCTIONAL. Relocated from rr `ai-router` and adopted
 * ALONGSIDE the untouched first-party AI engine (`convex/features/ai`).
 *
 * Upstream this drove a live OpenRouter call via `@openrouter/ai-sdk-provider`
 * + `ai` (generateText) and logged usage via an internal mutation. Neither
 * package is a superspace dependency at the pinned versions, so the provider
 * SDK call is stubbed out. The public signature + `args` validators are kept
 * intact so a supervised follow-up can wire the SDK (+ ensureUser +
 * requirePermission + logAuditEvent + rate-limit) with no client-side change.
 *
 * Behaviour:
 *  - No OPENROUTER_API_KEY -> graceful `{ ok:false, notice }` (fresh clones
 *    degrade instead of throwing).
 *  - Key present           -> throws the scaffold error (no live call wired).
 */
export const callModel = action({
  args: {
    feature: v.string(),
    prompt: v.string(),
    tier: v.union(v.literal("nano"), v.literal("mid"), v.literal("flagship")),
  },
  handler: async (
    _ctx,
    { feature, prompt, tier },
  ): Promise<{ ok: boolean; text?: string; notice?: string }> => {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return {
        ok: false,
        notice:
          "AI is not configured yet. Set OPENROUTER_API_KEY on the Convex deployment to enable live replies.",
      };
    }

    // Provider SDK intentionally NOT wired in superspace (scaffold). This
    // request would route to the tier model below. Re-introduce the
    // `@openrouter/ai-sdk-provider` + `ai` imports and call
    // `internal.features.aiRouter.mutation.logUsage` to enable live replies.
    throw new Error(
      `AI Router not configured — provider SDK not wired (scaffold). ` +
        `feature="${feature}" tier="${tier}" -> ${TIER_TO_MODEL[tier]} ` +
        `(prompt ${prompt.length} chars). ` +
        `Wire @openrouter/ai-sdk-provider + ai to enable live replies.`,
    );
  },
});
