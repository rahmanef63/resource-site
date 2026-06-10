# storefront-checkout — host wiring

The slice owns cart state + UI. The host owns pricing, the checkout route,
and the payment provider. Reference implementation: wirausaha-os
(`template-wirausaha-os` — convex/checkout.ts + slices/checkout/CheckoutPage.tsx).

## 1. Provider + header widget

```tsx
// app/(public)/layout.tsx
import { CartProvider, CartWidget } from "@/features/storefront-checkout";

<CartProvider storageKey="my-shop-cart">
  <SiteShell navExtras={<CartWidget checkoutHref="/checkout" />}>…</SiteShell>
</CartProvider>
```

## 2. Add-to-cart on product surfaces

```tsx
const { add } = useCart();
const unitPrice = item.price ?? parseIDR(item.priceLabel); // numeric, host-resolved
add({ slug: item.slug, name: item.name, price: unitPrice, priceLabel: item.priceLabel });
```

## 3. Server-side place-order action (Convex)

NEVER charge the client's subtotal. Re-price per line from your catalog:

```ts
// convex/checkout.ts (host) — see wirausaha-os for the full file
export const placeOrder = action({
  args: { items: /* [{slug, qty}] */, customer: /* {name,email,phone?} */, channel: v.string() },
  handler: async (ctx, args) => {
    const lines = await ctx.runQuery(internal.checkout.priceItems, { items: args.items }); // catalog lookup
    const amount = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const orderId = `ORD-${Date.now().toString(36)}-${/* 10 random chars */ ""}`;
    const payment = await ctx.runAction(api.features.payment.actions.doku.createDirectPayment, {
      orderId, amount, channel: args.channel, customer: args.customer,
    });
    if (!payment.ok) return payment; // creds unset → { ok:false, notice } (demo-safe)
    await ctx.runMutation(internal.checkout.recordOrder, { orderId, lines, /* … */ });
    return { ok: true, orderId, amount, instructions: payment.instructions, expiresAt: payment.expiresAt };
  },
});
```

## 4. Checkout page composition (with doku-payment)

```tsx
const { items, subtotal, clear } = useCart();
<CheckoutSummary />
<DokuDirectForm
  amount={subtotal}                       // display; server re-prices
  onSubmit={async (input) => {
    const r = await placeOrder({ items: items.map(i => ({ slug: i.slug, qty: i.qty })),
      customer: input.customer, channel: input.channel });
    if (!r.ok) throw new Error(r.notice); // surfaces in the form's error slot
    return { orderId: r.orderId, instructions: r.instructions, expiresAt: r.expiresAt };
  }}
  onSuccess={(r) => { setResult(r); clear(); }}
/>
// then render <DokuPaymentInstructions/> + reactive status via
// useQuery(api.features.payment.query.getOrderByOrderId, { orderId })
```

## Notes

- Guest checkout needs the doku-payment ≥0.2 backend (optional `userId` +
  `buyer` on paymentOrders, key-guarded actions, guest-readable status query).
- Empty-cart and payment-not-configured states are handled gracefully —
  fresh clones without DOKU creds show the form error + a contact fallback,
  never a crash.
