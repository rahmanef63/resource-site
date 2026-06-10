/**
 * Slice contract for `doku-payment` — Phase A.
 *
 * Encodes the documented operator backlog item: the legacy
 * `convex/features/payment/_schema.ts` shares `paymentOrders` /
 * `paymentWebhookEvents` between DOKU and Midtrans. Per the 2026-05-12
 * namespace decision, DOKU now owns `doku_orders` + `doku_webhook_events`
 * and explicitly conflicts with `midtrans-payment` over the old shared names.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "doku-payment",
  version: "0.3.0",
  // 0.2.0 (2026-06-10): guest checkout — paymentOrders.userId optional +
  // buyer contact; create actions key-guarded ({ok:false,notice} when DOKU
  // creds unset); status query guest-readable via unguessable orderId;
  // DokuDirectForm themed shadcn Select + server-generated-orderId flow.
  // `auth` below is for SIGNED-IN order ownership; guest mode needs none.
  requires: {
    auth: "convex",
    rbac: [
      "payment.create-order",
      "payment.view-order",
      "payment.cancel-order",
      "payment.refund",
      "payment.webhook-process",
    ],
    env: ["DOKU_CLIENT_ID", "DOKU_SECRET_KEY", "DOKU_IS_PRODUCTION", "DOKU_NOTIFY_PATH"],
    convex: {
      prefix: "doku_",
      tables: ["doku_orders", "doku_webhook_events"],
    },
    deps: ["convex-auth"],
  },
  provides: {
    tools: ["doku-payment.channels", "doku-payment.create_invoice", "doku-payment.status", "doku-payment.refund"],
    tables: ["doku_orders", "doku_webhook_events"],
    routes: ["/checkout/doku"],
    hooks: ["useDokuCheckout"],
    events: ["payment.captured", "payment.failed", "payment.refunded"],
    components: ["DokuCheckoutButton", "DokuWebhookProbe"],
  },
  conflicts: [
    "midtrans-payment:tables.paymentOrders",
    "midtrans-payment:tables.paymentWebhookEvents",
  ],
  // 2026-05-12 namespace decision (Phase E migration planner): when migrating
  // from the pre-namespace shape (paymentOrders / paymentWebhookEvents) the
  // planner pairs old → new names rather than emitting a destructive
  // drop+add. The marker string is opaque — only its presence matters.
  migrationFrom: {
    "0.9.0": "namespace-rename-2026-05",
  },
  generalization: {
    level: "portable",
    forbiddenTerms: ["midtrans"],
  },
});
