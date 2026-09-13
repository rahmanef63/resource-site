# Changelog — storefront-checkout


## 0.3.0 — 2026-09-13

- Extracted one framework-neutral cart store for localStorage hydration/persistence, qty accumulation/clamp, qty=0 removal, count/subtotal, and IDR formatting; React `CartProvider/useCart` is now an adapter.
- Added native Svelte 5/SvelteKit `CartWidget`, `CheckoutSummary`, and `createSvelteCartStore` while React/Next remains the default.
- Fixed catalog drift so the default React installer declares `lucide-react@^0.400.0`; added the missing public preview route as a thin host over canonical `preview.tsx`.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `storefrontCheckoutTools` — cart/add/set_qty/remove/clear over the live useCart() value (server re-prices at checkout).
