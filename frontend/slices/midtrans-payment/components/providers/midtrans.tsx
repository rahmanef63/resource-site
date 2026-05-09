"use client";

// Midtrans Snap-driven checkout button.
//
// Sibling provider slot at components/providers/doku.tsx (not yet shipped).
// Both providers expose the same `<*Checkout amount orderId>` shape so the
// parent CheckoutPage can route between them at install time.

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type MidtransCheckoutProps = {
  amount: number;
  orderId: string;
};

export function MidtransCheckout({ amount, orderId }: MidtransCheckoutProps) {
  const formatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  async function handleCheckout() {
    // Replace with: const res = await convex.action(api.payment.actions.midtrans.createTransaction, { amount, orderId });
    // Then: window.snap.pay(res.token, { onSuccess, onPending, onError })
    alert(`(stub) Midtrans Snap would open for ${formatted} (${orderId})`);
  }
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="text-sm text-muted-foreground">Order {orderId}</div>
      <div className="text-2xl font-semibold">{formatted}</div>
      <Button onClick={handleCheckout}>Pay with Midtrans</Button>
    </Card>
  );
}
