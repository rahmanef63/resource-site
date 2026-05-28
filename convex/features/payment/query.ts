import { query } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listMine = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("paymentOrders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 25);
  },
});

export const get = query({
  args: { orderId: v.string() },
  handler: async (ctx, { orderId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const order = await ctx.db
      .query("paymentOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .unique();
    if (!order || order.userId !== userId) return null;
    return order;
  },
});

/** Public reactive accessor consumed by `<DokuStatusBadge>`. Owner-only —
 *  anon callers get null. */
export const getOrderByOrderId = query({
  args: { orderId: v.string() },
  handler: async (ctx, { orderId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const order = await ctx.db
      .query("paymentOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .unique();
    if (!order || order.userId !== userId) return null;
    return {
      orderId: order.orderId,
      status: order.status,
      amount: order.amount,
      provider: order.provider,
      checkoutUrl: order.checkoutUrl ?? null,
      paymentChannel: order.paymentChannel ?? null,
      paymentInstructions: order.paymentInstructions ?? null,
      expiresAt: order.expiresAt ?? null,
      paidAt: order.paidAt ?? null,
    };
  },
});
