# `storefront-checkout` slice

Guest cart + checkout composition for catalog storefronts. The cart state,
localStorage persistence, quantity rules, count/subtotal, IDR formatting, and
agent tools now live in one framework-neutral core. React/Next remains the
default UI; Svelte 5/SvelteKit adds native cart + checkout surfaces over the
same core.

## Install

```bash
npx rr add storefront-checkout
# Svelte 5 / SvelteKit
npx rr add storefront-checkout --framework sveltekit
```

The optional `payment` peer owns the actual payment step. This slice has no
Convex backend of its own.

## Security boundary

- Client `price` / `subtotal` are display-only.
- The host MUST re-read each catalog `slug` and compute the final charge
  server-side before creating payment.
- A modified browser cart must never control the amount charged.

## React / Next

```tsx
import { CartProvider, CartWidget, useCart } from "@/features/storefront-checkout";

<CartProvider storageKey="my-shop-cart">
  <CartWidget checkoutHref="/checkout" />
</CartProvider>
```

`CartProvider` is now only a React adapter over the canonical `createCartStore`.

## Svelte / SvelteKit

```ts
import { createSvelteCartStore } from "@/features/storefront-checkout";
const cart = createSvelteCartStore("my-shop-cart");
```

Pass the same `cart` to `CartWidget` and `CheckoutSummary`. Browser hydration is
idempotent; quantity accumulation clamps at 99; `setQty(slug, 0)` removes a line.

Full host-side checkout/payment wiring remains documented in
[`HOST-SETUP.md`](./HOST-SETUP.md).
