"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { MidtransCheckout } from "./components/providers/midtrans";

const SCENARIOS: Record<string, { amount: number; orderId: string }> = {
  "single-item": { amount: 150_000, orderId: "ord_demo_single" },
  cart: { amount: 1_250_000, orderId: "ord_demo_cart" },
  subscription: { amount: 49_000, orderId: "sub_demo_monthly" },
};

const preview: SlicePreviewModule = {
  MidtransCheckout: ({ variant }) => {
    const scenario = variant.scenario ?? "single-item";
    const demo = SCENARIOS[scenario] ?? SCENARIOS["single-item"];
    return (
      <div className="p-4">
        <p className="mb-3 text-xs text-muted-foreground">
          Sandbox — the Pay button is a stub; no real Snap, no charge.
        </p>
        <div className="max-w-sm">
          <MidtransCheckout amount={demo.amount} orderId={demo.orderId} />
        </div>
      </div>
    );
  },
};
export default preview;
