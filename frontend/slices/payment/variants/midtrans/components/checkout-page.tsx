"use client";

// Checkout entry. Renders the provider-specific UI based on env-selected
// provider; today only "midtrans" is implemented. When `doku-payment` lands
// as a sibling slice, swap to a router that picks based on a session prefer.

import { MidtransCheckout } from "./providers/midtrans";
import type { MidtransCheckoutInput, MidtransCheckoutResult, MidtransCustomer } from "@/features/payment/lib/contracts";

export interface MidtransCheckoutPageProps {
  amount?: number;
  orderId?: string;
  customer?: MidtransCustomer;
  onCheckout?: (input: MidtransCheckoutInput) => Promise<MidtransCheckoutResult>;
  onPay?: (token: string, result: MidtransCheckoutResult) => void | Promise<void>;
}

export default function CheckoutPage({
  amount = 150_000,
  orderId = `ord_${Date.now()}`,
  customer,
  onCheckout,
  onPay,
}: MidtransCheckoutPageProps = {}) {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <MidtransCheckout
        amount={amount}
        orderId={orderId}
        customer={customer}
        onCheckout={onCheckout}
        onPay={onPay}
      />
    </main>
  );
}
