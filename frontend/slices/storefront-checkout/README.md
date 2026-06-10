# `storefront-checkout` slice

Guest cart + checkout composition for catalog storefronts. Anonymous buyers
add catalog items to a localStorage cart, then check out without an account —
the payment step plugs in via a sibling payment slice (`doku-payment` /
`midtrans-payment`).

Proven end-to-end on **wirausaha-os** (2026-06-10): catalog → cart →
server-priced `placeOrder` action → DOKU Direct instructions → webhook flips
the order to `paid` (reactive).

## What ships

```
frontend/slices/storefront-checkout/
├── lib/cart.tsx                ← CartProvider + useCart + formatIDR (localStorage)
├── components/CartWidget.tsx   ← header trigger (count badge) + slide-over sheet
└── components/CheckoutSummary.tsx ← order summary panel for the checkout page
```

No Convex imports anywhere — props-driven R3. The HOST owns:
- resolving a **numeric price** per catalog item before `add()`
- the checkout route + a **server-side place-order action** that RE-PRICES
  every line from the host's own catalog (client subtotal is display-only)
- the payment provider composition (see HOST-SETUP.md)

## Security model

- `price` in the cart is for display + UX only. The reference `placeOrder`
  action re-reads each `slug` from the catalog table and computes the charge
  server-side — a tampered client can never set its own amount.
- Guest order status reads use the unguessable `orderId` as the capability
  token (see `doku-payment`'s `getOrderByOrderId` guest mode).

## Quick start

```tsx
// layout — wrap once, mount the widget in your header extras
import { CartProvider, CartWidget } from "@/features/storefront-checkout";
<CartProvider storageKey="my-shop-cart">
  <SiteShell navExtras={<CartWidget checkoutHref="/checkout" />}>…</SiteShell>
</CartProvider>

// product page — add with a host-resolved numeric price
const { add } = useCart();
add({ slug, name, price: 22000, priceLabel: "Rp 22.000", emoji: "☕" });
```

Full checkout-page + Convex wiring → [`HOST-SETUP.md`](./HOST-SETUP.md).
