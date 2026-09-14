<script lang="ts">
  import { formatIDR } from "@/features/payment/lib/doku-core";
  import type {
    DokuCheckoutInput,
    DokuCheckoutResult,
    PaymentCustomer,
  } from "@/features/payment/lib/contracts";

  let {
    amount,
    orderId,
    customer,
    callbackUrl = undefined,
    paymentMethods = undefined,
    label = "Bayar dengan DOKU",
    onCheckout = undefined,
  } = $props<{
    amount: number;
    orderId: string;
    customer: PaymentCustomer;
    callbackUrl?: string;
    paymentMethods?: string[];
    label?: string;
    onCheckout?: (input: DokuCheckoutInput) => Promise<DokuCheckoutResult>;
  }>();

  let loading = $state(false);
  let error = $state<string | null>(null);

  async function checkout() {
    if (!onCheckout) {
      alert(`(stub) DOKU Checkout would open for ${formatIDR(amount)} (${orderId})`);
      return;
    }
    loading = true;
    error = null;
    try {
      const result = await onCheckout({ orderId, amount, customer, callbackUrl, paymentMethods });
      if ("ok" in result && result.ok === false) {
        error = result.notice;
        loading = false;
        return;
      }
      if (!result.checkoutUrl) throw new Error("No checkout URL returned");
      window.location.href = result.checkoutUrl;
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
    {loading ? "Memproses…" : label}
  </button>
  {#if error}<p class="text-sm text-destructive" role="alert">{error}</p>{/if}
</section>
