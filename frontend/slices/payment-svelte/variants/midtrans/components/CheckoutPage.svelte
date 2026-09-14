<script lang="ts">
  import type {
    MidtransCheckoutInput,
    MidtransCheckoutResult,
    MidtransCustomer,
  } from "@/features/payment/lib/contracts";
  import MidtransCheckout from "./providers/MidtransCheckout.svelte";

  let {
    amount = 150_000,
    orderId = "ord_demo",
    customer = undefined,
    onCheckout = undefined,
    onPay = undefined,
  } = $props<{
    amount?: number;
    orderId?: string;
    customer?: MidtransCustomer;
    onCheckout?: (input: MidtransCheckoutInput) => Promise<MidtransCheckoutResult>;
    onPay?: (token: string, result: MidtransCheckoutResult) => void | Promise<void>;
  }>();
</script>

<main class="mx-auto flex max-w-xl flex-col gap-6 p-8">
  <h1 class="text-2xl font-semibold">Checkout</h1>
  <MidtransCheckout {amount} {orderId} {customer} {onCheckout} {onPay} />
</main>
