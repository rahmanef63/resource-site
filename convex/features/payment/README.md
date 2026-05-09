# `payment` convex feature

Tables shared across providers (Midtrans, Doku, Stripe). Each provider's
business logic lives under `actions/<provider>.ts`.

## Tables

- `paymentOrders` — provider-agnostic order log. `provider` discriminator field.
- `paymentWebhookEvents` — raw inbound webhook payloads (audit trail).

## Add a new provider (e.g., Doku)

1. Create `convex/features/payment/actions/doku.ts` mirroring `midtrans.ts`'s shape (export `createTransaction`).
2. Add the provider literal to the `provider` union in `schema.ts`.
3. Add a frontend wrapper at `frontend/slices/midtrans-payment/components/providers/doku.tsx`.
4. Bump the slice's `version` (minor) and `providers` array.

The table layer doesn't change — that's the whole point.
