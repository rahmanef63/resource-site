# Payment

Indonesia payment providers behind one slug + one shared Convex backend
(`convex/features/payment`, provider-discriminated). Install one provider or both:

```bash
npx rr add payment doku       # DOKU Hosted Checkout + Direct
npx rr add payment midtrans    # Midtrans Snap
npx rr add payment             # both providers, shared backend
```

Either variant copies the shared `convex/features/payment` backend
(`paymentOrders` + `paymentWebhookEvents` carry a `provider` column).

## doku

```tsx
import { DokuCheckout, DokuDirectForm } from "@/features/payment";
```

Server-side env only: `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`. HMAC-SHA256 signed
REST, 22-channel Direct picker. No npm deps.

## midtrans

```tsx
import CheckoutPage from "@/features/payment/components/checkout-page";
```

Needs `npm i midtrans-client` + `MIDTRANS_SERVER_KEY` (convex) +
`NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` (browser Snap).

A future `stripe` variant is already reserved in the schema's `provider` union.
