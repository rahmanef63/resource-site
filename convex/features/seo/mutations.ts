import { mutation, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../_shared/auth";
import { seoPatchShape } from "./fields";

// Single mutation patches whichever surface table the action targets.
// Action computes metadata, calls this to persist. Validator-level union
// rejects bad table names before the handler ever runs.
export const applyGenerated = mutation({
  args: {
    token: v.string(),
    table: v.union(
      v.literal("blogPosts"),
      v.literal("upcomingProjects"),
      v.literal("portfolioItems"),
    ),
    rowId: v.string(),
    patch: v.object(seoPatchShape),
  },
  handler: async (ctx, { token, table, rowId, patch }) => {
    await requireAdmin(ctx, token);
    const id = ctx.db.normalizeId(table, rowId);
    if (!id) throw new Error(`Invalid id ${rowId} for ${table}`);
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
    return { success: true };
  },
});

export const _logGeneratorCall = internalMutation({
  args: {
    userEmail: v.string(),
    table: v.string(),
    rowId: v.string(),
    titleLen: v.number(),
    contentLen: v.number(),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("seoGeneratorCalls", {
      ...args,
      calledAt: Date.now(),
    });
    return { success: true };
  },
});
