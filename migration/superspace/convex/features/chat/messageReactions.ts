import { v } from "convex/values";
import { query, mutation } from "../../_generated/server";
import { ensureUser } from "../../auth/helpers";

// Add a reaction (unique per message,user,emoji)
export const addReaction = mutation({
  args: { messageId: v.id("messages"), emoji: v.string() },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    // Avoid duplicate (messageId, userId, emoji)
    const existing = await ctx.db
      .query("messageReactions")
      .withIndex("by_message_user", (q) =>
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .take(1000);

    // If same emoji already exists for this user on this message, return existing id
    const dup = existing.find((r: any) => r.emoji === args.emoji);
    if (dup) return dup._id;

    const id = await ctx.db.insert("messageReactions", {
      messageId: args.messageId,
      userId,
      emoji: args.emoji,
      createdAt: Date.now(),
    } as any);

    return id;
  },
});

// Remove a reaction by id (owner can remove)
export const removeReaction = mutation({
  args: { reactionId: v.id("messageReactions") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const reaction = await ctx.db.get(args.reactionId);
    if (!reaction) throw new Error("Reaction not found");

    // Allow reactor to remove their own reaction
    if (String(reaction.userId) !== String(userId)) {
      throw new Error("Not authorized to remove this reaction");
    }

    await ctx.db.delete(args.reactionId);
    return args.reactionId;
  },
});

// Get reactions for a message
export const getReactionsForMessage = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messageReactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .take(1000);
  },
});
