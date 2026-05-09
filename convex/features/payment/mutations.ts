import { internalMutation, mutation } from "../../_generated/server";
import { v } from "convex/values";

export const recordPending = internalMutation({
  args: {
    userId: v.id("users"),
    orderId: v.string(),
    amount: v.number(),
    snapToken: v.string(),
  },
  handler: async (ctx, { userId, orderId, amount, snapToken }) => {
    return ctx.db.insert("paymentOrders", {
      userId,
      orderId,
      amount,
      currency: "IDR",
      provider: "midtrans",
      status: "pending",
      snapToken,
      createdAt: Date.now(),
    });
  },
});

export const markPaid = mutation({
  args: { orderId: v.string(), providerTransactionId: v.string() },
  handler: async (ctx, { orderId, providerTransactionId }) => {
    const order = await ctx.db
      .query("paymentOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .unique();
    if (!order) throw new Error(`Order not found: ${orderId}`);
    await ctx.db.patch(order._id, {
      status: "paid",
      providerTransactionId,
      paidAt: Date.now(),
    });
  },
});
