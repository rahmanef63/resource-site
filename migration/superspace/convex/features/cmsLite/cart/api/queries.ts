import { query } from "../../_generated";
import { v } from "convex/values";

/**
 * Get the current user's active cart in a workspace
 */
export const getCurrentCart = query({
  args: {
    workspaceId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("carts"),
      _creationTime: v.number(),
      userId: v.string(),
      workspaceId: v.string(),
      status: v.string(),
      itemCount: v.number(),
      subtotal: v.number(),
      currency: v.string(),
      couponCode: v.optional(v.string()),
      discountAmount: v.optional(v.number()),
      lastActivityAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Find user's active cart in this workspace
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return cart;
  },
});

/**
 * Get items in a cart
 */
export const getCartItems = query({
  args: {
    cartId: v.id("carts"),
  },
  returns: v.array(
    v.object({
      _id: v.id("cartItems"),
      _creationTime: v.number(),
      cartId: v.id("carts"),
      productId: v.string(),
      productType: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      quantity: v.number(),
      unitPrice: v.number(),
      currency: v.string(),
      options: v.optional(
        v.array(
          v.object({
            name: v.string(),
            value: v.string(),
            priceModifier: v.optional(v.number()),
          })
        )
      ),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Verify cart ownership
    const cart = await ctx.db.get(args.cartId);
    if (!cart || cart.userId !== identity.subject) {
      return [];
    }

    // Get all items in the cart
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", args.cartId))
      .take(2000);

    return items;
  },
});

/**
 * List abandoned carts for admin view
 */
export const listAbandonedCarts = query({
  args: {
    workspaceId: v.string(),
    // Threshold in milliseconds (e.g., 24 hours = 24 * 60 * 60 * 1000)
    abandonedThreshold: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("carts"),
      _creationTime: v.number(),
      userId: v.string(),
      status: v.string(),
      itemCount: v.number(),
      subtotal: v.number(),
      currency: v.string(),
      lastActivityAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Require admin permission
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const threshold = Date.now() - args.abandonedThreshold;

    // Find carts that haven't been active recently
    const abandonedCarts = await ctx.db
      .query("carts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.lt(q.field("lastActivityAt"), threshold)
        )
      )
      .take(2000);

    return abandonedCarts;
  },
});

