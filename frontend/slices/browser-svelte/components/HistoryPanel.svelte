<script lang="ts">
  import { relTime, type HistoryEntry } from "../../browser/lib/storage-core";

  type Props = {
    open: boolean;
    history: HistoryEntry[];
    onOpen: (url: string) => void;
    onClear: () => void;
    onClose: () => void;
  };
  let { open, history, onOpen, onClear, onClose }: Props = $props();
</script>

{#if open}
  <div class="absolute inset-0 z-10 overflow-auto bg-background/95 p-4 backdrop-blur-sm">
    <div class="mx-auto max-w-2xl">
      <header class="mb-4 flex items-center gap-2">
        <h2 class="text-lg font-semibold">History</h2>
        <button class="ml-auto rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary" onclick={onClear}>Clear</button>
        <button class="rounded-md border px-3 py-1.5 text-xs" onclick={onClose}>Close</button>
      </header>
      {#if history.length === 0}
        <p class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No browsing history yet.</p>
      {:else}
        <div class="divide-y rounded-lg border bg-card">
          {#each history as item (`${item.url}-${item.time}`)}
            <button class="flex w-full items-start gap-3 p-3 text-left hover:bg-secondary/60" onclick={() => onOpen(item.url)}>
              <span class="mt-0.5 text-muted-foreground">◎</span>
              <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{item.title}</span><span class="block truncate text-xs text-muted-foreground">{item.url}</span></span>
              <span class="text-[10px] text-muted-foreground">{relTime(item.time)}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
