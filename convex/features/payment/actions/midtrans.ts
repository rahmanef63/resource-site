"use node";

// Midtrans Snap action — creates a transaction + returns the snap token.
// Webhook handler at httpAction (TODO — add convex/features/payment/http.ts
// when wiring in your project).

import { action } from "../../../_generated/server";
import { internal } from "../../../_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createTransaction = action({
  args: {
    orderId: v.string(),
    amount: v.number(),
    customer: v.optional(
      v.object({
        first_name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { orderId, amount, customer }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Lazy-import: keeps the Convex bundle slim until first use.
    const Midtrans = await import("midtrans-client");
    const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const snap = new Midtrans.Snap({
      isProduction: isProd,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const transaction = await snap.createTransaction({
      transaction_details: { order_id: orderId, gross_amount: amount },
      customer_details: customer,
    });

    await ctx.runMutation(internal.features.payment.mutations.recordPending, {
      userId,
      orderId,
      amount,
      snapToken: transaction.token,
    });

    return { token: transaction.token, redirectUrl: transaction.redirect_url };
  },
});
