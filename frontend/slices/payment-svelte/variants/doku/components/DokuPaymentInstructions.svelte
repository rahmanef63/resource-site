<script lang="ts">
  import {
    CHANNEL_BY_ID,
    groupVa,
    timeLeft,
  } from "@/features/payment/lib/doku-core";
  import type { PaymentInstructions } from "@/features/payment/lib/contracts";

  let {
    channel,
    instructions,
    expiresAt = undefined,
  } = $props<{
    channel: string;
    instructions: PaymentInstructions;
    expiresAt?: number;
  }>();

  let copied = $state(false);
  let tick = $state(0);
  let meta = $derived(CHANNEL_BY_ID.get(channel));
  let left = $derived((tick, timeLeft(expiresAt)));

  $effect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => (tick += 1), 1000);
    return () => clearInterval(timer);
  });

  async function copyVa() {
    if (!instructions.vaNumber) return;
    try {
      await navigator.clipboard.writeText(instructions.vaNumber);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      copied = false;
    }
  }
</script>

<section class="flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
  <header class="flex items-center justify-between gap-4">
    <div>
      <div class="text-xs uppercase tracking-wide text-muted-foreground">Bayar via</div>
      <div class="text-lg font-semibold">{meta?.label ?? channel}</div>
    </div>
    {#if left}<div class="text-xs text-muted-foreground">Berlaku {left}</div>{/if}
  </header>

  {#if instructions.vaNumber}
    <div class="flex flex-col gap-2">
      <div class="rounded-md bg-muted p-3 font-mono text-lg tracking-wider">{groupVa(instructions.vaNumber)}</div>
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" onclick={copyVa} class="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
          {copied ? "Tersalin ✓" : "Salin nomor VA"}
        </button>
        {#if instructions.howToPayUrl}
          <a href={instructions.howToPayUrl} target="_blank" rel="noreferrer" class="text-sm text-muted-foreground underline">Cara bayar</a>
        {/if}
      </div>
    </div>
  {/if}

  {#if instructions.qrImageUrl || instructions.qrString}
    <div class="flex flex-col items-center gap-2">
      {#if instructions.qrImageUrl}
        <img src={instructions.qrImageUrl} alt="QRIS" width="224" height="224" class="size-56 rounded-md border" />
      {:else}
        <pre class="max-w-full overflow-x-auto rounded-md border bg-muted p-3 text-[10px]">{instructions.qrString}</pre>
      {/if}
      <p class="text-xs text-muted-foreground">Scan dengan aplikasi e-wallet atau mobile banking apa pun.</p>
    </div>
  {/if}

  {#if instructions.deeplink || instructions.webUrl}
    <div class="flex flex-col gap-2">
      {#if instructions.deeplink}
        <a href={instructions.deeplink} target="_blank" rel="noopener noreferrer" class="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90">Buka aplikasi e-Wallet</a>
      {/if}
      {#if instructions.webUrl}
        <a href={instructions.webUrl} target="_blank" rel="noreferrer" class="rounded-md bg-secondary px-3 py-2 text-center text-sm font-medium text-secondary-foreground hover:bg-secondary/80">Bayar di browser</a>
      {/if}
    </div>
  {/if}

  {#if instructions.paymentUrl && !instructions.deeplink && !instructions.vaNumber}
    <a href={instructions.paymentUrl} target="_blank" rel="noopener noreferrer" class="underline">Lanjut ke halaman pembayaran →</a>
  {/if}

  {#if meta?.hint}<p class="text-xs text-muted-foreground">{meta.hint}</p>{/if}
</section>
