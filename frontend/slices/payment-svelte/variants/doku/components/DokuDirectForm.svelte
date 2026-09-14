<script lang="ts">
  import {
    GROUP_LABELS,
    groupDokuChannels,
    formatIDR,
    type ChannelGroup,
  } from "@/features/payment/lib/doku-core";
  import type {
    DokuDirectInput,
    DokuDirectResult,
    PaymentCustomer,
    PaymentInstructions,
  } from "@/features/payment/lib/contracts";

  let {
    amount,
    orderId = undefined,
    defaultCustomer = {},
    allowedChannels = undefined,
    onSubmit = undefined,
    onSuccess = undefined,
  } = $props<{
    amount: number;
    orderId?: string;
    defaultCustomer?: Partial<PaymentCustomer>;
    allowedChannels?: string[];
    onSubmit?: (input: DokuDirectInput) => Promise<DokuDirectResult>;
    onSuccess?: (result: {
      orderId?: string;
      channel: string;
      instructions: PaymentInstructions;
      expiresAt?: number;
    }) => void;
  }>();

  let channel = $state("QRIS");
  let name = $state("");
  let email = $state("");
  let phone = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);
  let groups = $derived(groupDokuChannels(allowedChannels));

  $effect(() => {
    name = defaultCustomer.name ?? "";
    email = defaultCustomer.email ?? "";
    phone = defaultCustomer.phone ?? "";
  });

  $effect(() => {
    const available = Object.values(groups).flat();
    if (!available.some((item) => item.id === channel)) channel = available[0]?.id ?? "";
  });

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!channel) {
      error = "Tidak ada metode pembayaran yang tersedia";
      return;
    }
    if (!onSubmit) {
      alert(`(stub) DOKU Direct for ${channel} ${formatIDR(amount)}`);
      return;
    }
    loading = true;
    error = null;
    try {
      const result = await onSubmit({
        orderId,
        amount,
        channel,
        customer: { name, email, phone: phone || undefined },
      });
      if ("ok" in result && result.ok === false) {
        error = result.notice;
        return;
      }
      onSuccess?.({
        orderId: result.orderId ?? orderId,
        channel,
        instructions: result.instructions,
        expiresAt: result.expiresAt,
      });
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Gagal membuat pembayaran";
    } finally {
      loading = false;
    }
  }
</script>

<section class="flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
  <header>
    {#if orderId}<div class="text-sm text-muted-foreground">Order {orderId}</div>{/if}
    <div class="text-2xl font-semibold">{formatIDR(amount)}</div>
  </header>

  <form onsubmit={submit} class="flex flex-col gap-3">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label class="flex flex-col gap-1.5 text-sm">
        <span class="font-medium">Nama</span>
        <input bind:value={name} required class="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
      </label>
      <label class="flex flex-col gap-1.5 text-sm">
        <span class="font-medium">Email</span>
        <input bind:value={email} type="email" required class="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
      </label>
      <label class="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span class="font-medium">Nomor HP (opsional)</span>
        <input bind:value={phone} class="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
      </label>
    </div>

    <label class="flex flex-col gap-1.5 text-sm">
      <span class="font-medium">Metode pembayaran</span>
      <select bind:value={channel} class="h-10 rounded-md border bg-background px-3">
        {#each Object.keys(groups) as group (group)}
          {@const id = group as ChannelGroup}
          {#if groups[id].length}
            <optgroup label={GROUP_LABELS[id]}>
              {#each groups[id] as item}
                <option value={item.id}>{item.label}</option>
              {/each}
            </optgroup>
          {/if}
        {/each}
      </select>
    </label>

    <button type="submit" disabled={loading || !channel} class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
      {loading ? "Memproses…" : "Lanjut Bayar"}
    </button>
    {#if error}<p class="text-sm text-destructive" role="alert">{error}</p>{/if}
  </form>
</section>
