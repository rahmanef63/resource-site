// payment tables — shared across Midtrans / Doku / future providers.
// Provider-specific actions live in convex/features/payment/actions/<provider>.ts;
// the table shape stays provider-agnostic.

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const paymentTables = {
  paymentOrders: defineTable({
    userId: v.id("users"),
    orderId: v.string(),
    amount: v.number(),
    currency: v.string(),
    provider: v.union(v.literal("midtrans"), v.literal("doku"), v.literal("stripe")),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("expired"),
      v.literal("refunded"),
    ),
    providerTransactionId: v.optional(v.string()),
    snapToken: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_orderId", ["orderId"])
    .index("by_status_createdAt", ["status", "createdAt"]),

  paymentWebhookEvents: defineTable({
    provider: v.string(),
    eventType: v.string(),
    payload: v.any(),
    receivedAt: v.number(),
    processed: v.boolean(),
  }).index("by_provider_received", ["provider", "receivedAt"]),
};
