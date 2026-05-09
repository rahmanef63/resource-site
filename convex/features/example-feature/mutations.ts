import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const userId = await getAuthUserId(ctx);
    return ctx.db.insert("exampleItems", {
      title,
      createdAt: Date.now(),
      createdBy: userId ?? undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("exampleItems") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    if (!item) return;
    const userId = await getAuthUserId(ctx);
    if (item.createdBy && item.createdBy !== userId) {
      throw new Error("Not allowed to delete this item.");
    }
    await ctx.db.delete(id);
  },
});
