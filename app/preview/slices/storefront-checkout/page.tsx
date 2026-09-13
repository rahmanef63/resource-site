"use client";

import * as React from "react";
import preview from "@/features/storefront-checkout/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CartWidgetPreview = preview.CartWidget;
type Seeded = "empty" | "filled";

export default function Page() {
  const [seeded, setSeeded] = React.useState<Seeded>("filled");

  return (
    <SlicePreviewLayout
      title="Storefront Checkout"
      kind="ui"
      description="Guest cart persistence, quantity controls, subtotal, and checkout composition over the canonical preview module."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/storefront-checkout"
    >
      <PreviewSection title="Cart widget" hint={`seeded="${seeded}"`}>
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["empty", "filled"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              onClick={() => setSeeded(value)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs",
                seeded === value ? "bg-accent font-medium" : "text-muted-foreground",
              )}
            >
              {value}
            </Button>
          ))}
        </div>
        <CartWidgetPreview variant={{ seeded }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
