# Payment — DOKU + Midtrans

Provider-discriminated Indonesia payment slice with one Convex data model and provider-specific install footprints. React/Next is the default renderer; Svelte 5/SvelteKit is available explicitly.

## Install

```bash
# React / Next default
npx rr add payment doku
npx rr add payment midtrans
npx rr add payment             # both providers

# Native Svelte 5 / SvelteKit
npx rr add payment doku --framework sveltekit
npx rr add payment midtrans --framework sveltekit
npx rr add payment --framework sveltekit
```

CLI 1.18+ gates provider runtime dependencies and backend files per variant:

- `doku` copies the DOKU action/helpers + shared payment schema/query/mutation/webhook support, asks only for DOKU env, and installs **no provider npm SDK**.
- `midtrans` copies the Midtrans action + shared payment schema/query/mutation/webhook support, adds `midtrans-client`, and asks only for Midtrans env.
- add-all receives the union of both provider footprints.

`@convex-dev/auth` is installed because signed-in ownership resolves user IDs through `getAuthUserId()`; guest calls still receive `null` when unauthenticated. `convex/_shared/crypto.ts` is copied automatically for webhook/signature verification. The broader `convex-auth` slice remains an optional feature-level peer.

## Security boundary

The UI is props-driven and never imports provider secrets. Bind Convex actions in the consumer and pass them into the checkout components.

DOKU keeps `DOKU_CLIENT_ID` / `DOKU_SECRET_KEY` server-side, signs outbound REST requests with HMAC-SHA256, verifies inbound webhook signatures, and keeps webhook/order transitions idempotent.

Midtrans keeps `MIDTRANS_SERVER_KEY` server-side. Only the browser client key is public (`NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`). Its webhook verifies `signature_key` before mutating order state.

The 0.5.0 frontend parity release does **not** weaken or move these backend checks into the client.

## DOKU

React:

```tsx
import { DokuCheckout, DokuDirectForm } from "@/features/payment";

<DokuCheckout
  amount={150_000}
  orderId={orderId}
  customer={customer}
  onCheckout={createCheckoutPayment}
/>
```

Svelte exposes the equivalent `DokuCheckout`, `DokuDirectForm`, `DokuPaymentInstructions`, `DokuStatusBadge`, and composed checkout page. `onCheckout` / `onDirectSubmit` accept consumer-bound server actions.

DOKU create actions are credential-guarded: missing merchant credentials return `{ ok: false, notice }` instead of crashing a fresh clone. Both React and Svelte render that notice truthfully.

## Midtrans

React and Svelte `MidtransCheckout` accept:

- `onCheckout(input)` — bind `api.features.payment.actions.midtrans.createTransaction`.
- `onPay(token, result)` — optional Snap bridge. If omitted, `redirectUrl` is used as the hosted fallback.

The Midtrans variant also exposes an orders surface for rows from `api.features.payment.query.listMine`.

## Agent tools

`dokuPaymentTools` and `midtransPaymentTools` are framework-neutral structural tool collections. Create/refund remain marked `dangerous`; hosts may require explicit user confirmation. RBAC, credentials, and payment mutations remain server-side in the injected context.

## Webhook wiring

```ts
import { httpRouter } from "convex/server";
import { dokuWebhook, midtransWebhook } from "./features/payment/http";

const http = httpRouter();
http.route({ path: "/webhooks/doku", method: "POST", handler: dokuWebhook });
http.route({ path: "/webhooks/midtrans", method: "POST", handler: midtransWebhook });
export default http;
```

A future `stripe` provider remains reserved in the backend provider union but is not shipped as a frontend variant yet.
