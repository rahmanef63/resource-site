<script lang="ts">
  import { onMount } from "svelte";
  import { formatIDR } from "../../storefront-checkout/lib/core";
  import type { SvelteCartStore } from "../lib/store";

  type Props = {
    store: SvelteCartStore;
    title?: string;
    class?: string;
  };

  let { store, title = "Ringkasan pesanan", class: className = "" }: Props = $props();
  let cart = $derived($store);

  onMount(() => store.hydrateBrowser());
</script>

<section class={`rounded-xl border bg-card p-5 ${className}`}>
  <h2 class="text-base font-semibold">{title}</h2>
  <ul class="mt-4 space-y-2">
    {#each cart.items as item (item.slug)}
      <li class="flex items-baseline justify-between gap-3 text-sm">
        <span class="min-w-0 truncate">
          {#if item.emoji}<span aria-hidden="true" class="mr-1.5">{item.emoji}</span>{/if}
          {item.name}<span class="ml-1 text-muted-foreground">× {item.qty}</span>
        </span>
        <span class="tabular-nums">{formatIDR(item.price * item.qty)}</span>
      </li>
    {/each}
  </ul>
  <div class="my-4 border-t"></div>
  <div class="flex items-center justify-between">
    <span class="text-sm text-muted-foreground">Total</span>
    <span class="text-lg font-semibold tabular-nums">{formatIDR(cart.subtotal)}</span>
  </div>
  <p class="mt-2 text-xs text-muted-foreground">
    Total final dihitung ulang di server saat pembayaran dibuat.
  </p>
</section>
