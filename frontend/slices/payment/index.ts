// payment — Indonesia payment providers behind one slug and ONE shared Convex
// backend (convex/features/payment, provider-discriminated: paymentOrders +
// paymentWebhookEvents carry a `provider` column). Two frontend variants:
//   doku      — Hosted Checkout + Direct channel picker, 22-channel registry,
//               HMAC-signed REST, dependency-free, server-side env.
//   midtrans  — Snap hosted-checkout button + orders history; needs npm
//               `midtrans-client` + a NEXT_PUBLIC_MIDTRANS_CLIENT_KEY.
// Install one with `npx rr add payment doku|midtrans`, or both with
// `npx rr add payment`. Both variants copy the shared payment backend.
export * from "./variants/doku";
export * from "./variants/midtrans";
export { paymentFeature } from "./config";
