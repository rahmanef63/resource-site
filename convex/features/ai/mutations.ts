import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";

export const logUsage = internalMutation({
  args: {
    feature: v.string(),
    tier: v.union(v.literal("nano"), v.literal("mid"), v.literal("flagship")),
    inputTokens: v.number(),
    outputTokens: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("aiUsage", { ...args, at: Date.now() });
  },
});
