"use node";

import { action } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";

const TIER_TO_MODEL = {
  nano: "anthropic/claude-haiku-4-5",
  mid: "anthropic/claude-sonnet-4-6",
  flagship: "anthropic/claude-opus-4-7",
} as const;

/**
 * Key-guarded like its sibling `aiChat/chat`: returns `{ ok:false, notice }`
 * when OPENROUTER_API_KEY is unset so fresh clones degrade instead of
 * throwing. NOTE: public action driving paid spend — if you compose the
 * rate-limit slice, gate this with
 * `ctx.runMutation(internal.features.rate_limit.mutation.consume, { key: "ai:" + callerId })`
 * before the model call (not imported here to avoid a hard peer coupling).
 */
export const callModel = action({
  args: {
    feature: v.string(),
    prompt: v.string(),
    tier: v.union(v.literal("nano"), v.literal("mid"), v.literal("flagship")),
  },
  handler: async (
    ctx,
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
    const { generateText } = await import("ai");
    const { createOpenRouter } = await import("@openrouter/ai-sdk-provider");
    const router = createOpenRouter({ apiKey: key });

    const { text, usage } = await generateText({
      model: router(TIER_TO_MODEL[tier]),
      prompt,
    });

    await ctx.runMutation(internal.features.ai.mutation.logUsage, {
      feature,
      tier,
      inputTokens: usage?.promptTokens ?? 0,
      outputTokens: usage?.completionTokens ?? 0,
    });

    return { ok: true, text };
  },
});
