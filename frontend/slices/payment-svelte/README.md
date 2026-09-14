# Payment — Svelte 5 / SvelteKit

Native Svelte renderers for the provider-discriminated `payment` slice. The Convex payment backend remains shared and authoritative; secret keys, HMAC verification, webhooks, amount validation, and provider SDK calls stay server-side.

## Install

```bash
npx rr add payment doku --framework sveltekit
npx rr add payment midtrans --framework sveltekit
npx rr add payment --framework sveltekit
```

- **DOKU** ships hosted checkout, Direct channel picker, payment instructions, and status badge. It needs no provider npm SDK; only DOKU env is requested and the DOKU action/backend subset is copied.
- **Midtrans** ships a checkout button + orders surface. Its variant alone adds `midtrans-client`, Midtrans env, and the Midtrans action/backend subset.
- `onCheckout` / `onDirectSubmit` props accept consumer-bound Convex actions. No Convex client runtime is imported by the UI.
- `dokuPaymentTools` and `midtransPaymentTools` remain server-gated structural tool collections; `dangerous` is preserved on create/refund so an agent host can require user confirmation.
