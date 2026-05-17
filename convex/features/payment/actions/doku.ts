"use node";

/**
 * DOKU payment actions — three entry points matching the official MCP tools:
 *
 *   createCheckoutPayment — hosted page (all enabled channels)
 *   createDirectPayment   — single-channel call, returns instructions
 *   getPaymentStatus      — poll for status (webhook is primary path)
 *
 * Each call:
 *   1. Requires an authenticated user (anonymous payments not supported).
 *   2. Validates amount > 0.
 *   3. Inserts a paymentOrders row (status="pending") before hitting DOKU.
 *   4. On error, marks the order failed; on success, patches the row with
 *      the channel-specific payload.
 *
 * Webhook is the authoritative status update path; getPaymentStatus is a
 * convenience for UI polling / order detail pages.
 */

import { action } from "../../../_generated/server";
import { internal } from "../../../_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { dokuFetch, DokuApiError } from "../doku/client";
import type {
  DokuChannel,
  DokuCheckoutRequest,
  DokuCheckoutResponse,
  DokuDirectRequest,
  DokuDirectResponse,
  DokuStatusResponse,
} from "../doku/types";
import {
  buildCustomer,
  buildOrder,
  customerArg,
  extractInstructions,
  itemsArg,
  routeForChannel,
} from "./doku-helpers";

// ─── Checkout (hosted) ───────────────────────────────────────────────────

export const createCheckoutPayment = action({
  args: {
    orderId: v.string(),
    amount: v.number(),
    customer: customerArg,
    callbackUrl: v.optional(v.string()),
    expiryMinutes: v.optional(v.number()),
    /** Restrict the hosted page to a subset of channels; omit = all. */
    paymentMethods: v.optional(v.array(v.string())),
    /** Free-form items for the receipt. */
    items: itemsArg,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (args.amount <= 0) throw new Error("Amount must be > 0");

    await ctx.runMutation(internal.features.payment.mutations.recordDokuPending, {
      userId,
      orderId: args.orderId,
      amount: args.amount,
    });

    try {
      const payload = {
        order: buildOrder({
          invoiceNumber: args.orderId,
          amount: args.amount,
          callbackUrl: args.callbackUrl,
          expiryMinutes: args.expiryMinutes,
        }),
        customer: buildCustomer(args.customer),
        payment_method_types: args.paymentMethods,
        line_items: args.items,
      } as unknown as DokuCheckoutRequest;

      const res = await dokuFetch<DokuCheckoutResponse>({
        method: "POST",
        path: "/checkout/v1/payment",
        body: payload,
      });

      const expiresAt = res.payment?.expired_date
        ? Date.parse(res.payment.expired_date)
        : undefined;

      await ctx.runMutation(internal.features.payment.mutations.attachDokuCheckout, {
        orderId: args.orderId,
        checkoutUrl: res.payment.url,
        expiresAt,
      });

      return {
        checkoutUrl: res.payment.url,
        token: res.payment.token,
        expiresAt,
      };
    } catch (err) {
      await ctx.runMutation(
        internal.features.payment.mutations.markFailedByWebhook,
        { orderId: args.orderId, status: "failed" },
      );
      if (err instanceof DokuApiError) {
        throw new Error(`DOKU checkout failed (${err.status}): ${err.message}`);
      }
      throw err;
    }
  },
});

// ─── Direct payment (single channel) ─────────────────────────────────────

export const createDirectPayment = action({
  args: {
    orderId: v.string(),
    amount: v.number(),
    channel: v.string(), // DokuChannel — kept as string for flexibility
    customer: customerArg,
    callbackUrl: v.optional(v.string()),
    expiryMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (args.amount <= 0) throw new Error("Amount must be > 0");

    await ctx.runMutation(internal.features.payment.mutations.recordDokuPending, {
      userId,
      orderId: args.orderId,
      amount: args.amount,
      paymentChannel: args.channel,
    });

    try {
      const payload = {
        channel: args.channel as DokuChannel,
        order: buildOrder({
          invoiceNumber: args.orderId,
          amount: args.amount,
          callbackUrl: args.callbackUrl,
          expiryMinutes: args.expiryMinutes,
        }),
        customer: buildCustomer(args.customer),
      } as unknown as DokuDirectRequest;

      const res = await dokuFetch<DokuDirectResponse>({
        method: "POST",
        path: routeForChannel(args.channel),
        body: payload,
      });

      const instructions = extractInstructions(res);
      const expiresAt = res.expired_date ? Date.parse(res.expired_date) : undefined;

      await ctx.runMutation(internal.features.payment.mutations.attachDokuDirect, {
        orderId: args.orderId,
        paymentInstructions: instructions,
        expiresAt,
      });

      return { instructions, expiresAt };
    } catch (err) {
      await ctx.runMutation(
        internal.features.payment.mutations.markFailedByWebhook,
        { orderId: args.orderId, status: "failed" },
      );
      if (err instanceof DokuApiError) {
        throw new Error(`DOKU direct failed (${err.status}): ${err.message}`);
      }
      throw err;
    }
  },
});

// ─── Status poll ─────────────────────────────────────────────────────────

export const getPaymentStatus = action({
  args: { orderId: v.string() },
  handler: async (_ctx, args) => {
    const res = await dokuFetch<DokuStatusResponse>({
      method: "GET",
      path: `/orders/v1/status/${encodeURIComponent(args.orderId)}`,
    });
    return {
      status: res.order.status,
      paidAt: res.transaction?.date ? Date.parse(res.transaction.date) : null,
      providerTxId: res.transaction?.id ?? null,
      channel: res.payment?.channel ?? null,
    };
  },
});
