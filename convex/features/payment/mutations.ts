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

export const recordWebhookEvent = internalMutation({
  args: {
    provider: v.string(),
    eventType: v.string(),
    requestId: v.optional(v.string()),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    // Idempotency short-circuit — DOKU retries failed deliveries with the
    // same request_id. Midtrans uses transaction_id similarly.
    if (args.requestId) {
      const existing = await ctx.db
        .query("paymentWebhookEvents")
        .withIndex("by_provider_request", (q) =>
          q.eq("provider", args.provider).eq("requestId", args.requestId),
        )
        .first();
      if (existing) return existing._id;
    }
    return ctx.db.insert("paymentWebhookEvents", {
      ...args,
      receivedAt: Date.now(),
      processed: false,
    });
  },
});

// ─── Doku-specific record helpers ─────────────────────────────────────────

export const recordDokuPending = internalMutation({
  args: {
    userId: v.id("users"),
    orderId: v.string(),
    amount: v.number(),
    paymentChannel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotent — if the order already exists (retry), patch instead of insert.
    const existing = await ctx.db
      .query("paymentOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        amount: args.amount,
        paymentChannel: args.paymentChannel,
      });
      return existing._id;
    }
    return ctx.db.insert("paymentOrders", {
      userId: args.userId,
      orderId: args.orderId,
      amount: args.amount,
      currency: "IDR",
      provider: "doku",
      status: "pending",
      paymentChannel: args.paymentChannel,
      createdAt: Date.now(),
    });
  },
});

export const attachDokuCheckout = internalMutation({
  args: {
    orderId: v.string(),
    checkoutUrl: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("paymentOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();
    if (!order) throw new Error(`Order not found: ${args.orderId}`);
    await ctx.db.patch(order._id, {
      checkoutUrl: args.checkoutUrl,
      expiresAt: args.expiresAt,
    });
  },
});

export const attachDokuDirect = internalMutation({
  args: {
    orderId: v.string(),
    paymentInstructions: v.any(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("paymentOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();
    if (!order) throw new Error(`Order not found: ${args.orderId}`);
    await ctx.db.patch(order._id, {
      paymentInstructions: args.paymentInstructions,
      expiresAt: args.expiresAt,
    });
  },
});

export const markWebhookProcessed = internalMutation({
  args: { eventId: v.id("paymentWebhookEvents") },
  handler: async (ctx, { eventId }) => {
    await ctx.db.patch(eventId, { processed: true });
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
    if (order.status === "paid") return; // idempotent
    await ctx.db.patch(order._id, {
      status: "paid",
      providerTransactionId,
      paidAt: Date.now(),
    });
  },
});

export const markPaidByWebhook = internalMutation({
  args: { orderId: v.string(), providerTransactionId: v.string() },
  handler: async (ctx, { orderId, providerTransactionId }) => {
    const order = await ctx.db
      .query("paymentOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .unique();
    if (!order || order.status === "paid") return; // idempotent
    await ctx.db.patch(order._id, {
      status: "paid",
      providerTransactionId,
      paidAt: Date.now(),
    });
  },
});

export const markFailedByWebhook = internalMutation({
  args: {
    orderId: v.string(),
    status: v.union(v.literal("failed"), v.literal("expired")),
  },
  handler: async (ctx, { orderId, status }) => {
    const order = await ctx.db
      .query("paymentOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .unique();
    if (!order) return;
    if (order.status === "paid") return; // don't downgrade paid
    await ctx.db.patch(order._id, { status });
  },
});
