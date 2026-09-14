"use client";

// Midtrans Snap-driven checkout button.
//
// Sibling provider slot at components/providers/doku.tsx (not yet shipped).
// Both providers expose the same `<*Checkout amount orderId>` shape so the
// parent CheckoutPage can route between them at install time.

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MidtransCheckoutInput, MidtransCheckoutResult, MidtransCustomer } from "@/features/payment/lib/contracts";
export type { MidtransCheckoutInput, MidtransCheckoutResult, MidtransCustomer } from "@/features/payment/lib/contracts";

type MidtransCheckoutProps = {
  amount: number;
  orderId: string;
  customer?: MidtransCustomer;
  label?: string;
  /** Pass useAction(api.features.payment.actions.midtrans.createTransaction). */
  onCheckout?: (input: MidtransCheckoutInput) => Promise<MidtransCheckoutResult>;
  /** Optional Snap bridge; when omitted, redirectUrl is used as a hosted fallback. */
  onPay?: (token: string, result: MidtransCheckoutResult) => void | Promise<void>;
};

export function MidtransCheckout({
  amount,
  orderId,
  customer,
  label = "Pay with Midtrans",
  onCheckout,
  onPay,
}: MidtransCheckoutProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

  async function handleCheckout() {
    if (!onCheckout) {
      alert(`(stub) Midtrans Snap would open for ${formatted} (${orderId})`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await onCheckout({ amount, orderId, customer });
      if (onPay) await onPay(result.token, result);
      else if (result.redirectUrl) window.location.href = result.redirectUrl;
      else throw new Error("Midtrans returned a Snap token but no onPay bridge or redirect URL");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout gagal");
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="text-sm text-muted-foreground">Order {orderId}</div>
      <div className="text-2xl font-semibold">{formatted}</div>
      <Button onClick={handleCheckout} disabled={loading}>
        {loading ? "Processing…" : label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </Card>
  );
}
