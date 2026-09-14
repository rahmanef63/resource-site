# Payment / Midtrans variant

Midtrans Snap checkout + orders UI over the shared provider-discriminated payment backend.

## Install

```bash
npx rr add payment midtrans
npx rr add payment midtrans --framework sveltekit
```

CLI 1.18+ copies the Midtrans action plus shared payment schema/query/mutation/webhook support, installs `midtrans-client`, and asks only for Midtrans env.

## Env

```text
MIDTRANS_SERVER_KEY=…
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=…
MIDTRANS_IS_PRODUCTION=false
```

The server key remains server-side. The client key is intentionally public for Snap.js.

## UI wiring

`MidtransCheckout` in React and Svelte accepts an injected `onCheckout` action and optional `onPay` Snap bridge:

```tsx
<MidtransCheckout
  amount={150_000}
  orderId={orderId}
  onCheckout={createTransaction}
  onPay={(token) => window.snap.pay(token)}
/>
```

If no `onPay` bridge is supplied, a returned `redirectUrl` is used as the hosted fallback. With no action supplied, the slice remains an explicit demo stub rather than pretending a payment occurred.

## Webhook

```ts
http.route({ path: "/webhooks/midtrans", method: "POST", handler: midtransWebhook });
```

The webhook verifies Midtrans `signature_key` before mutating payment state.
