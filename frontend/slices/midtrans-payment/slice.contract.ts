/**
 * Slice contract for `midtrans-payment` — Phase A.
 *
 * Sibling provider to `doku-payment`. Both originally shared the legacy
 * `paymentOrders` / `paymentWebhookEvents` Convex tables (operator backlog
 * item documented in slice.manifest.json `notes`). Per the 2026-05-12
 * namespace decision, Midtrans now owns `midtrans_orders` +
 * `midtrans_webhook_events` and Doku owns `doku_orders` +
 * `doku_webhook_events`. Once both contracts declare disjoint prefixes the
 * collision is structurally dead — the compose-solver green-lights both.
 *
 * Track G (2026-05-14): introduces this contract together with the
 * `M-doku-namespace-2026-05` + `M-midtrans-namespace-2026-05` Convex
 * migration scripts that copy rows out of the legacy shared tables.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "midtrans-payment",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["payment.create", "payment.refund"],
    env: ["MIDTRANS_CLIENT_KEY", "MIDTRANS_SERVER_KEY", "MIDTRANS_ENV"],
    convex: {
      prefix: "midtrans_",
      tables: ["midtrans_orders", "midtrans_webhook_events"],
    },
    deps: ["convex-auth"],
  },
  provides: {
    tables: ["midtrans_orders", "midtrans_webhook_events"],
    routes: ["/checkout/midtrans", "/midtrans/callback"],
    hooks: ["useMidtransPayment"],
    components: ["MidtransSnap", "MidtransStatusBadge"],
    events: ["midtrans.payment.created", "midtrans.payment.captured", "midtrans.webhook.received"],
  },
  // Intentionally empty — same shape as doku-payment but disjoint namespaces.
  // The `.filter(() => false)` keeps the array literal in source for symmetry
  // with doku-payment's contract while encoding "no real conflicts" at runtime.
  conflicts: [
    "doku-payment:tables.doku_orders",
    "doku-payment:tables.doku_webhook_events",
  ].filter(() => false),
  // 2026-05-12 namespace decision (Phase E migration planner): when migrating
  // from the pre-namespace shape (paymentOrders / paymentWebhookEvents) the
  // planner pairs old → new names rather than emitting a destructive
  // drop+add. The marker string is opaque — only its presence matters.
  migrationFrom: {
    "0.9.0": "namespace-rename-2026-05",
  },
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "portable",
      forbiddenTerms: ["doku"],
    },
  },
});
