<script lang="ts">
  import type { AgentLogEntry } from "../../browser/lib/host-core";
  import { relTime } from "../../browser/lib/storage-core";

  type Props = {
    open: boolean;
    fetchLog: () => Promise<AgentLogEntry[]>;
    onClose: () => void;
  };
  let { open, fetchLog, onClose }: Props = $props();
  let rows = $state<AgentLogEntry[]>([]);
  let loading = $state(false);
  let lastOpen = false;

  $effect(() => {
    if (!open || lastOpen) {
      lastOpen = open;
      return;
    }
    lastOpen = true;
    loading = true;
    void fetchLog()
      .then((next) => (rows = next))
      .finally(() => (loading = false));
  });

  const when = (value?: string) => {
    const time = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(time) ? relTime(time) : "";
  };
</script>

{#if open}
  <aside class="absolute right-0 top-0 z-20 flex h-full w-[min(22rem,88%)] flex-col border-l border-border bg-card/95 shadow-xl backdrop-blur" aria-label="AI browser activity">
    <header class="flex items-center gap-2 border-b border-border px-3 py-2">
      <span aria-hidden="true">✦</span>
      <h3 class="text-sm font-semibold">Agent activity</h3>
      <button class="ml-auto rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary" onclick={onClose}>Close</button>
    </header>
    <div class="min-h-0 flex-1 overflow-auto p-3">
      {#if loading}
        <p class="text-xs text-muted-foreground">Loading activity…</p>
      {:else if rows.length === 0}
        <p class="text-xs text-muted-foreground">No browser agent activity yet.</p>
      {:else}
        <ol class="space-y-2">
          {#each rows as row, i (`${row.ts ?? i}-${row.action}`)}
            <li class="rounded-lg border bg-background p-2.5">
              <div class="flex items-center gap-2"><code class="text-[11px] font-semibold">{row.action}</code><span class="ml-auto text-[10px] text-muted-foreground">{when(row.ts)}</span></div>
              <p class="mt-1 text-[11px] text-muted-foreground">{row.actor ?? "agent"}{row.target ? ` · ${row.target}` : ""}</p>
            </li>
          {/each}
        </ol>
      {/if}
    </div>
  </aside>
{/if}
