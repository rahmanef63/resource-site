# Payment / DOKU variant

DOKU Hosted Checkout + Direct payment UI over the shared provider-discriminated payment backend.

## Install

```bash
npx rr add payment doku
npx rr add payment doku --framework sveltekit
```

CLI 1.18+ copies only the DOKU provider action/helpers plus shared payment schema/query/mutation/webhook support. It does **not** install `midtrans-client` and no longer requires deleting the Midtrans action manually.

## Backend/security

- `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, `DOKU_IS_PRODUCTION`, `DOKU_NOTIFY_PATH` stay in Convex/server env.
- Outbound REST uses HMAC-SHA256 signing.
- Incoming DOKU notifications verify the signature before state changes.
- Webhook events and order transitions remain idempotent.
- Create actions validate positive amount and are credential-guarded: missing keys return `{ ok:false, notice }` so demos/fresh clones do not crash.
- Guest checkout remains supported with buyer contact on the order and an unguessable `orderId` as the guest status capability.

## UI wiring

The renderer imports no Convex client runtime. Bind actions in the consumer and pass them as props:

```tsx
<DokuCheckout onCheckout={createCheckoutPayment} {...props} />
<DokuDirectForm onSubmit={createDirectPayment} {...props} />
```

Svelte exposes the same hosted/direct contracts plus payment-instructions and status components.

## Webhook

```ts
http.route({ path: "/webhooks/doku", method: "POST", handler: dokuWebhook });
```

Set the DOKU merchant Notification URL to the corresponding Convex HTTP Action URL.
