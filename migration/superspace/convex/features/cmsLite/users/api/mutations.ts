import { mutation } from "../../_generated";
import { v } from "convex/values";
import { logAuditEvent } from "../../../../shared/audit";

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    bio: v.optional(v.string()),
    title: v.optional(v.string()),
    location: v.optional(v.string()),
    links: v.optional(v.array(
      v.object({
        type: v.string(),
        url: v.string(),
        label: v.optional(v.string()),
      })
    )),
    preferences: v.optional(v.record(v.string(), v.any())),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get user to verify ownership or admin status
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Only allow users to update their own profile unless they're an admin
    if (user.clerkId !== identity.subject) {
      throw new Error("Not authorized to update other user profiles");
    }

    // Get existing profile or create new one
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        bio: args.bio,
        title: args.title,
        location: args.location,
        links: args.links,
        preferences: args.preferences,
        metadata: args.metadata,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        bio: args.bio,
        title: args.title,
        location: args.location,
        links: args.links,
        preferences: args.preferences,
        metadata: args.metadata,
      });
    }

    await logAuditEvent(ctx, {
      workspaceId: "system",
      action: "users.update_profile",
      actor: identity.subject,
      target: {
        type: "user",
        id: args.userId,
        workspaceId: "system",
      },
    });
  },
});

