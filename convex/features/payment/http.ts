// Midtrans webhook handler.
//
// Wire in your consumer's convex/http.ts:
//
//   import { httpRouter } from "convex/server";
//   import { midtransWebhook } from "./features/payment/http";
//   const http = httpRouter();
//   http.route({ path: "/webhooks/midtrans", method: "POST", handler: midtransWebhook });
//   export default http;
//
// Midtrans signature spec (Snap):
//   signature_key = SHA512(order_id + status_code + gross_amount + server_key)
// Reference: https://docs.midtrans.com/reference/notification-webhook-http
//
// We fail-fast on signature mismatch so a forged payload can't flip an order
// to "paid". Idempotent: marking an already-paid order as paid is a no-op.

import { httpAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { constantTimeEqual, sha512Hex } from "../../_shared/crypto";

type MidtransNotification = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_id: string;
  payment_type?: string;
};

export const midtransWebhook = httpAction(async (ctx, req) => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return new Response("MIDTRANS_SERVER_KEY not configured", { status: 500 });
  }

  let body: MidtransNotification;
  try {
    body = (await req.json()) as MidtransNotification;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const expected = await sha512Hex(
    `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`,
  );
  if (!constantTimeEqual(expected, body.signature_key ?? "")) {
    return new Response("Signature mismatch", { status: 401 });
  }

  // Map Midtrans transaction_status → our status enum.
  const statusMap: Record<string, "paid" | "pending" | "failed" | "expired"> = {
    capture: body.fraud_status === "challenge" ? "pending" : "paid",
    settlement: "paid",
    pending: "pending",
    deny: "failed",
    cancel: "failed",
    expire: "expired",
    failure: "failed",
  };
  const status = statusMap[body.transaction_status] ?? "pending";

  await ctx.runMutation(internal.features.payment.mutations.recordWebhookEvent, {
    provider: "midtrans",
    eventType: body.transaction_status,
    payload: body,
  });

  if (status === "paid") {
    await ctx.runMutation(internal.features.payment.mutations.markPaidByWebhook, {
      orderId: body.order_id,
      providerTransactionId: body.transaction_id,
    });
  } else if (status === "failed" || status === "expired") {
    await ctx.runMutation(internal.features.payment.mutations.markFailedByWebhook, {
      orderId: body.order_id,
      status,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
