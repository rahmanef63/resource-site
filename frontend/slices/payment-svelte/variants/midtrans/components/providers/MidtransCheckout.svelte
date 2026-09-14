<script lang="ts">
  import { formatIDR } from "@/features/payment/lib/doku-core";
  import type {
    MidtransCheckoutInput,
    MidtransCheckoutResult,
    MidtransCustomer,
  } from "@/features/payment/lib/contracts";

  let {
    amount,
    orderId,
    customer = undefined,
    label = "Pay with Midtrans",
    onCheckout = undefined,
    onPay = undefined,
  } = $props<{
    amount: number;
    orderId: string;
    customer?: MidtransCustomer;
    label?: string;
    onCheckout?: (input: MidtransCheckoutInput) => Promise<MidtransCheckoutResult>;
    onPay?: (token: string, result: MidtransCheckoutResult) => void | Promise<void>;
  }>();

  let loading = $state(false);
  let error = $state<string | null>(null);

  async function checkout() {
    if (!onCheckout) {
      alert(`(stub) Midtrans Snap would open for ${formatIDR(amount)} (${orderId})`);
      return;
    }
    loading = true;
    error = null;
    try {
      const result = await onCheckout({ amount, orderId, customer });
      if (onPay) await onPay(result.token, result);
      else if (result.redirectUrl) window.location.href = result.redirectUrl;
      else throw new Error("Midtrans returned a Snap token but no onPay bridge or redirect URL");
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Checkout gagal";
      loading = false;
    }
  }
</script>

<section class="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
  <div class="text-sm text-muted-foreground">Order {orderId}</div>
  <div class="text-2xl font-semibold">{formatIDR(amount)}</div>
  <button
    type="button"
    disabled={loading}
    onclick={checkout}
    class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
  >
    {loading ? "Processing…" : label}
  </button>
  {#if error}<p class="text-sm text-destructive" role="alert">{error}</p>{/if}
</section>
