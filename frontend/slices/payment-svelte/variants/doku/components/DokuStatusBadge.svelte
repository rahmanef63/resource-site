<script lang="ts">
  import { DOKU_STATUS_LABEL } from "@/features/payment/lib/doku-core";
  import type { DokuStatus } from "@/features/payment/lib/contracts";

  let {
    status,
    onResync = undefined,
  } = $props<{
    status: DokuStatus;
    onResync?: () => void | Promise<unknown>;
  }>();

  const statusClass: Record<DokuStatus, string> = {
    pending: "bg-secondary text-secondary-foreground",
    client_claimed: "bg-secondary text-secondary-foreground",
    paid: "bg-primary text-primary-foreground",
    failed: "bg-destructive text-destructive-foreground",
    expired: "border bg-background text-foreground",
    refunded: "border bg-background text-foreground",
  };
</script>

<div class="flex items-center gap-2">
  <span class={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[status]}`}>{DOKU_STATUS_LABEL[status]}</span>
  {#if status === "pending" && onResync}
    <button type="button" onclick={() => void onResync?.()} class="rounded-md px-2 py-1 text-xs hover:bg-accent">Cek ulang</button>
  {/if}
</div>
