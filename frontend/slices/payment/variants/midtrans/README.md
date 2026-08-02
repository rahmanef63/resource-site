# `midtrans-payment` slice

Midtrans Snap checkout + webhook handler + simple order history.

## Provider extensibility

Designed so adding **Doku** (or Stripe, Xendit, etc.) is mechanical:

```
frontend/slices/midtrans-payment/components/providers/
├── midtrans.tsx         ← shipped
└── doku.tsx             ← drop-in sibling

convex/features/payment/action/
├── midtrans.ts          ← shipped
└── doku.ts              ← drop-in sibling
```

Each provider exposes the same `<*Checkout amount orderId>` and the same
action signature `createTransaction({ amount, orderId, userId })`. The
slice's CheckoutPage routes by env (`PAYMENT_PROVIDER=midtrans|doku`) or by
a per-user preference.

When you add Doku:
1. `mkdir frontend/slices/midtrans-payment/components/providers && touch doku.tsx`
2. `mkdir convex/features/payment/action && touch doku.ts`
3. Bump `slice.json.providers` to `["midtrans","doku"]`.
4. Bump `version` minor.

Or — a cleaner long-term split — publish `doku-payment` as its own slice with
`peers: [{ slug: "payment-base" }]`. Both forms are valid; pick based on
overlap (shared types/types.ts → same slice; near-zero overlap → sibling slice).

## Env vars

```
MIDTRANS_SERVER_KEY=…           # convex (set via `npx convex env set` for self-hosted)
MIDTRANS_CLIENT_KEY=…           # next-public (NEXT_PUBLIC_MIDTRANS_CLIENT_KEY in .env.local)
MIDTRANS_IS_PRODUCTION=false    # convex; defaults sandbox
```

## Wiring (consumer)

```ts
// convex/schema.ts
import { paymentTables } from "./features/payment/_schema";
export default defineSchema({ ...paymentTables, /* others */ });
```

```tsx
// app/checkout/page.tsx
export { default } from "@/features/midtrans-payment/components/checkout-page";
```

Snap.js loader: drop `<script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} />` in your `app/layout.tsx` head (or use `next/script`).
