# `payment` convex feature

Provider-agnostic Convex tables + per-provider actions for Midtrans / DOKU
(/ future Stripe…). Copy-source: consumers compose this into their own
backend on `rr add` (rr's own deployment never registers it — see CLAUDE.md
hard rule 6).

## Tables (ACTUAL schema — `_schema.ts`)

One shared table set with a `provider` discriminator:

- `paymentOrders` — userId (OPTIONAL → guest checkout; guests carry a
  `buyer` contact object instead), orderId (unguessable, doubles as the
  guest capability token), amount, currency, provider
  (`midtrans|doku|stripe`), status (`pending → client_claimed|paid|failed|
  expired|refunded` — only the signature-verified webhook may set `paid`),
  provider payloads (snapToken / checkoutUrl / paymentChannel /
  paymentInstructions), timestamps.
- `paymentWebhookEvents` — provider, eventType, requestId (idempotency
  index), raw payload, processed flag.

> **History note.** A 2026-05-14 plan proposed splitting into per-provider
> tables (`doku_orders` / `midtrans_orders`); one-shot rename migrations
> exist at `convex/migrations/M_{doku,midtrans}_namespace_2026_05.ts` and
> `doku-payment/slice.contract.ts` still encodes that target. The split was
> **never applied** — the shared shape above is what ships and what the
> actions/webhooks read. Run the migrations only if you deliberately adopt
> the namespaced design; otherwise ignore them.

## Guest checkout (0.2.0, 2026-06-10)

- `createCheckoutPayment` / `createDirectPayment` work signed-out: userId
  is attached when present, otherwise the `customer` arg is stored as
  `buyer`.
- Both actions are **key-guarded**: missing `DOKU_CLIENT_ID` /
  `DOKU_SECRET_KEY` returns `{ ok: false, notice }` (never throws) so demo
  sites and fresh clones degrade gracefully.
- `query.getOrderByOrderId`: owned orders stay owner-only; guest orders are
  readable by anyone holding the orderId.
- Server-side pricing is the CONSUMER's job: pair with the
  `storefront-checkout` slice and a place-order action that re-prices every
  line from your catalog (reference: template-wirausaha-os
  `convex/checkout.ts`).

## Module paths (watch the singular!)

Files are `mutation.ts` / `query.ts`, so generated refs are
`internal.features.payment.mutation.*` and `api.features.payment.query.*`
(NOT `.mutations.` / `.queries.` — that drift broke the first consumer).

## Consumer wiring

```ts
// convex/schema.ts
import { paymentTables } from "./features/payment/_schema";
export default defineSchema({ ...paymentTables /* , your tables */ });

// convex/http.ts
import { dokuWebhook } from "./features/payment/http";
http.route({ path: "/webhooks/doku", method: "POST", handler: dokuWebhook });
```

DOKU-only consumers: **delete `actions/midtrans.ts`** (it imports the
`midtrans-client` npm package — Convex bundling fails without it) or
install `midtrans-client@^1.4.2`.

## Add a new provider (e.g., Stripe)

1. `convex/features/payment/actions/stripe.ts` mirroring doku's shape
   (key-guarded create + status actions).
2. `convex/features/payment/stripe/{client,signature,types}.ts`.
3. Add the `stripe` literal where needed (already in the provider union).
4. A `frontend/slices/stripe-payment/` slice for the UI.
