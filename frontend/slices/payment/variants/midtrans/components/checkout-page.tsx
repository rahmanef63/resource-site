"use client";

// Checkout entry. Renders the provider-specific UI based on env-selected
// provider; today only "midtrans" is implemented. When `doku-payment` lands
// as a sibling slice, swap to a router that picks based on a session prefer.

import { MidtransCheckout } from "./providers/midtrans";

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <MidtransCheckout amount={150_000} orderId={`ord_${Date.now()}`} />
    </main>
  );
}
