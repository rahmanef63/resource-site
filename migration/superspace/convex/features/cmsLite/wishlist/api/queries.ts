import { query } from "../../_generated";
import { v } from "convex/values";
import { requirePermission } from "../../../../shared/auth";
import { Id } from "../../_generated";

// Get a single wishlist by ID
export const getWishlist = query({
  args: {
    workspaceId: v.string(),
    wishlistId: v.string(),
  },
  async handler(ctx, args) {
    const wishlist = await ctx.db.get(args.wishlistId as Id<"wishlists">);
    if (!wishlist || wishlist.workspaceId !== args.workspaceId) {
      return null;
    }

    // If the wishlist is not public, verify user has access
    if (!wishlist.isPublic) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }

      // Check if user owns the wishlist or has admin access
      if (wishlist.userId !== identity.subject) {
        try {
          await requirePermission(ctx, args.workspaceId, "wishlist.manage");
        } catch {
          return null;
        }
      }
    }

    // Get items in the wishlist
    const items = await ctx.db
      .query("wishlistItems")
      .withIndex("by_wishlist", (q) => q.eq("wishlistId", args.wishlistId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(2000);

    return {
      ...wishlist,
      items,
    };
  },
});

// List wishlists for a workspace user
export const listUserWishlists = query({
  args: {
    workspaceId: v.string(),
    userId: v.string(),
    includeArchived: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    let q = ctx.db
      .query("wishlists")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", args.userId)
      );

    if (!args.includeArchived) {
      q = q.filter((q) => q.eq(q.field("status"), "active"));
    }

    const wishlists = await q.take(500);

    // Get items for each wishlist
    return await Promise.all(
      wishlists.map(async (wishlist) => {
        const items = await ctx.db
          .query("wishlistItems")
          .withIndex("by_wishlist", (q) => q.eq("wishlistId", wishlist._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .take(2000);

        return {
          ...wishlist,
          items,
        };
      })
    );
  },
});

// Get a wishlist by share token
export const getSharedWishlist = query({
  args: {
    shareToken: v.string(),
  },
  async handler(ctx, args) {
    const wishlist = await ctx.db
      .query("wishlists")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .unique();

    if (!wishlist) {
      return null;
    }

    // Get items in the wishlist
    const items = await ctx.db
      .query("wishlistItems")
      .withIndex("by_wishlist", (q) => q.eq("wishlistId", wishlist._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(2000);

    return {
      ...wishlist,
      items,
    };
  },
});

