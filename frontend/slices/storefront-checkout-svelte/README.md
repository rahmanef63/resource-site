# Storefront Checkout — Svelte 5 / SvelteKit

Native guest-cart UI over the canonical framework-neutral cart store. React/Next
remains the default distribution.

```bash
npx rr add storefront-checkout --framework sveltekit
```

Create one `createSvelteCartStore(storageKey)` and pass it to `CartWidget` and
`CheckoutSummary`. Browser hydration is idempotent, localStorage persistence is
SSR-safe, quantities clamp to 1..99, qty 0 removes a line, and count/subtotal are
computed by the shared core.

Client price/subtotal remains display-only: the host MUST re-price every cart
line server-side at checkout. The optional `payment` peer still owns the actual
payment step.
