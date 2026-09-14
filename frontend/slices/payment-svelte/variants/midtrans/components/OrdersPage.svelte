<script lang="ts">
  import { formatIDR } from "@/features/payment/lib/doku-core";
  import type { PaymentOrderSummary } from "@/features/payment/lib/contracts";

  let { orders = undefined } = $props<{ orders?: PaymentOrderSummary[] }>();
</script>

<main class="mx-auto flex max-w-3xl flex-col gap-4 p-8">
  <h1 class="text-2xl font-semibold">Your orders</h1>
  {#if !orders}
    <p class="text-sm text-muted-foreground">Stub — pass rows from `api.features.payment.query.listMine`.</p>
  {:else if orders.length === 0}
    <p class="text-sm text-muted-foreground">No payment orders yet.</p>
  {:else}
    <div class="overflow-hidden rounded-xl border">
      <div class="divide-y">
        {#each orders as order (order.orderId)}
          <div class="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4">
            <div>
              <div class="font-mono text-sm">{order.orderId}</div>
              <div class="text-xs text-muted-foreground">{order.provider}</div>
            </div>
            <div class="text-sm font-medium">{formatIDR(order.amount)}</div>
            <span class="w-fit rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">{order.status}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</main>
