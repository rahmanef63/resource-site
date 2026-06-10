/**
 * storefront-checkout — guest cart + checkout composition.
 *
 * Cart state is client-side (React context + localStorage) so anonymous
 * buyers keep their cart across reloads with zero backend. The slice is
 * props-driven R3: no convex/react imports — the HOST resolves numeric
 * prices into `add()` and re-prices server-side when placing the order
 * (client subtotal is display-only; never trust it for the charge).
 *
 * Born 2026-06-10 from the wirausaha-os guest-checkout build-out
 * (catalog → cart → placeOrder action → doku-payment instructions).
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "storefront-checkout",
  version: "0.1.0",
  category: "content",
  kind: "ui",
  provides: {
    components: ["CartProvider", "CartWidget", "CheckoutSummary"],
    utils: ["formatIDR"],
    hooks: ["useCart"],
    types: ["CartItem"],
  },
  requires: {
    npm: [],
    shadcn: ["badge", "button", "card", "separator", "sheet"],
    env: [],
    peers: ["doku-payment"],
    routes: [],
    tables: [],
  },
});
