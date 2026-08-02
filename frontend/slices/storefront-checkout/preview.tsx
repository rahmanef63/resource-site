"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import * as React from "react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { CartProvider, useCart } from "./lib/cart";
import { CartWidget } from "./components/CartWidget";

function SeedCart({ seeded }: { seeded: boolean }) {
  const { add, items } = useCart();
  React.useEffect(() => {
    if (!seeded || items.length > 0) return;
    add(
      {
        slug: "kopi-susu-gula-aren",
        name: "Kopi Susu Gula Aren",
        price: 22000,
        priceLabel: "Rp 22.000",
        emoji: "☕",
      },
      2,
    );
    add({
      slug: "roti-bakar-coklat",
      name: "Roti Bakar Coklat Lumer",
      price: 18000,
      priceLabel: "Rp 18.000",
      emoji: "🍞",
    });
    // seed once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seeded]);
  return null;
}

const CartWidgetPreview: SlicePreviewModule["CartWidget"] = ({ variant }) => {
  const seeded = (variant.seeded as string) !== "empty";

  return (
    <div className="p-4">
      <CartProvider storageKey={`preview-cart-${seeded ? "filled" : "empty"}`}>
        <SeedCart seeded={seeded} />
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <CartWidget checkoutHref="#" />
          <span className="text-xs text-muted-foreground">
            {seeded
              ? "Two demo items seeded — open the sheet for qty steppers + subtotal."
              : "Empty cart — open the sheet for the empty state."}
          </span>
        </div>
      </CartProvider>
    </div>
  );
};

const previews: SlicePreviewModule = {
  CartWidget: CartWidgetPreview,
};

export default previews;
