"use node";

import { action } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";

const TIER_TO_MODEL = {
  nano: "anthropic/claude-haiku-4-5",
  mid: "anthropic/claude-sonnet-4-6",
  flagship: "anthropic/claude-opus-4-7",
} as const;

export const callModel = action({
  args: {
    feature: v.string(),
    prompt: v.string(),
    tier: v.union(v.literal("nano"), v.literal("mid"), v.literal("flagship")),
  },
  handler: async (ctx, { feature, prompt, tier }) => {
    const { generateText } = await import("ai");
    const { createOpenRouter } = await import("@openrouter/ai-sdk-provider");
    const router = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

    const { text, usage } = await generateText({
      model: router(TIER_TO_MODEL[tier]),
      prompt,
    });

    await ctx.runMutation(internal.features.ai.mutations.logUsage, {
      feature,
      tier,
      inputTokens: usage?.promptTokens ?? 0,
      outputTokens: usage?.completionTokens ?? 0,
    });

    return text;
  },
});
