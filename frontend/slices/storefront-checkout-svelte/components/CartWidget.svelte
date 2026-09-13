<script lang="ts">
  import { onMount } from "svelte";
  import { formatIDR } from "../../storefront-checkout/lib/core";
  import type { SvelteCartStore } from "../lib/store";

  type Props = {
    store: SvelteCartStore;
    checkoutHref?: string;
    class?: string;
  };

  let { store, checkoutHref = "/checkout", class: className = "" }: Props = $props();
  let open = $state(false);
  let cart = $derived($store);

  onMount(() => store.hydrateBrowser());
</script>

<div class={`inline-flex ${className}`}>
  <button
    type="button"
    class="relative grid size-9 place-items-center rounded-md border bg-background text-sm"
    aria-label={`Keranjang (${cart.count} item)`}
    aria-expanded={open}
    onclick={() => (open = true)}
  >
    <span aria-hidden="true">🛒</span>
    {#if cart.count > 0}
      <span class="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
        {cart.count > 99 ? "99+" : cart.count}
      </span>
    {/if}
  </button>

  {#if open}
    <button
      type="button"
      class="fixed inset-0 z-40 bg-black/30"
      aria-label="Tutup keranjang"
      onclick={() => (open = false)}
    ></button>
    <aside aria-label="Keranjang" class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-background shadow-xl">
      <div class="flex items-center justify-between border-b px-4 py-3">
        <h2 class="font-semibold">Keranjang</h2>
        <button type="button" class="rounded px-2 py-1 text-sm" onclick={() => (open = false)}>Tutup</button>
      </div>

      {#if cart.items.length === 0}
        <p class="flex-1 px-4 py-6 text-sm text-muted-foreground">
          Keranjang masih kosong. Tambahkan produk dari katalog.
        </p>
      {:else}
        <ul class="flex-1 space-y-4 overflow-y-auto p-4">
          {#each cart.items as item (item.slug)}
            <li class="flex items-start gap-3">
              {#if item.emoji}<span aria-hidden="true" class="text-2xl leading-none">{item.emoji}</span>{/if}
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">{item.name}</p>
                <p class="text-xs text-muted-foreground">{item.priceLabel}</p>
                <div class="mt-2 flex items-center gap-2">
                  <button type="button" class="grid size-7 place-items-center rounded border" aria-label={`Kurangi ${item.name}`} onclick={() => cart.setQty(item.slug, item.qty - 1)}>−</button>
                  <span class="w-7 text-center text-sm tabular-nums">{item.qty}</span>
                  <button type="button" class="grid size-7 place-items-center rounded border" aria-label={`Tambah ${item.name}`} onclick={() => cart.setQty(item.slug, item.qty + 1)}>+</button>
                  <button type="button" class="rounded px-2 py-1 text-xs text-muted-foreground underline" aria-label={`Hapus ${item.name}`} onclick={() => cart.remove(item.slug)}>Hapus</button>
                </div>
              </div>
              <span class="text-sm font-medium tabular-nums">{formatIDR(item.price * item.qty)}</span>
            </li>
          {/each}
        </ul>
      {/if}

      <div class="mt-auto space-y-3 border-t p-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Subtotal</span>
          <span class="text-base font-semibold tabular-nums">{formatIDR(cart.subtotal)}</span>
        </div>
        {#if cart.items.length > 0}
          <a class="block rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground" href={checkoutHref} onclick={() => (open = false)}>
            Lanjut ke pembayaran
          </a>
        {:else}
          <span class="block rounded-md bg-muted px-4 py-2 text-center text-sm text-muted-foreground">Lanjut ke pembayaran</span>
        {/if}
      </div>
    </aside>
  {/if}
</div>
