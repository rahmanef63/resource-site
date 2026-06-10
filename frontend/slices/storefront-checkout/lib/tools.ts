// Agentic tool collection. Ctx mirrors the cart context value (useCart()):
// register from a component inside <CartProvider> via
// `useAgentTools(storefrontCheckoutTools, useCart())`. Server re-prices on
// checkout — the agent only edits the client cart.

import { defineToolCollection, noArgs, num, obj, str } from "@/shared/agentic";
import type { CartItem } from "./cart";

export type StorefrontCheckoutCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const summary = (ctx: StorefrontCheckoutCtx): string =>
  `${ctx.count} item(s), subtotal ${ctx.subtotal} IDR: ${ctx.items.map((i) => `${i.slug}×${i.qty}`).join(", ") || "empty"}`;

export const storefrontCheckoutTools = defineToolCollection<StorefrontCheckoutCtx>({
  namespace: "storefront-checkout",
  instructions: "Shopping cart. Read cart before mutating; the server re-prices on checkout, so client totals are display-only; clear empties the cart.",
  describe: summary,
  tools: [
    {
      name: "cart",
      description: "Read the cart (items, quantities, subtotal).",
      parameters: noArgs,
      run: (ctx) => summary(ctx),
    },
    {
      name: "add",
      description: "Add a catalog item to the cart (price is display-only; server re-prices at checkout).",
      parameters: obj({
        "slug!": str("catalog slug"),
        "name!": str("display name"),
        "price!": num("unit price in IDR"),
        qty: num("quantity (default 1)", { min: 1 }),
      }),
      run: (ctx, a) => {
        ctx.add(
          { slug: a.slug as string, name: a.name as string, price: a.price as number, priceLabel: `${a.price}` },
          (a.qty as number | undefined) ?? 1,
        );
        return summary(ctx);
      },
    },
    {
      name: "set_qty",
      description: "Set an item's quantity (0 removes it).",
      parameters: obj({ "slug!": str("catalog slug"), "qty!": num("new quantity", { min: 0 }) }),
      run: (ctx, a) => {
        ctx.setQty(a.slug as string, a.qty as number);
        return summary(ctx);
      },
    },
    {
      name: "remove",
      description: "Remove an item from the cart.",
      parameters: obj({ "slug!": str("catalog slug") }),
      run: (ctx, a) => {
        ctx.remove(a.slug as string);
        return summary(ctx);
      },
    },
    {
      name: "clear",
      description: "Empty the cart.",
      parameters: noArgs,
      run: (ctx) => {
        ctx.clear();
        return "cart cleared";
      },
    },
  ],
});
