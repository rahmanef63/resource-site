<script lang="ts">
  import {
    MOCK_AUDIT,
    type AuditEntry,
  } from "@/features/admin/variants/console/lib/mock";

  let { entries = MOCK_AUDIT }: { entries?: AuditEntry[] } = $props();
  let query = $state("");
  let active = $state<AuditEntry | null>(null);
  let rows = $derived.by(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter((entry) =>
      [entry.actor, entry.action, entry.target].join(" ").toLowerCase().includes(needle),
    );
  });
</script>

<div class="space-y-3">
  <label class="block max-w-sm">
    <span class="sr-only">Filter audit events</span>
    <input
      bind:value={query}
      placeholder="Filter by actor, action or target…"
      class="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
    />
  </label>

  <div class="overflow-x-auto rounded-md border">
    <table class="w-full text-sm">
      <thead class="border-b bg-muted/40 text-left text-xs text-muted-foreground">
        <tr><th class="p-3">When</th><th>Actor</th><th>Action</th><th>Target</th><th class="w-16"></th></tr>
      </thead>
      <tbody>
        {#each rows as entry (entry.id)}
          <tr class="border-b last:border-0">
            <td class="whitespace-nowrap p-3 text-xs text-muted-foreground">{new Date(entry.at).toLocaleString()}</td>
            <td>{entry.actor}</td>
            <td><span class="rounded-full border px-2 py-0.5 text-xs">{entry.action}</span></td>
            <td>{entry.target}</td>
            <td>
              {#if entry.before !== undefined || entry.after !== undefined}
                <button type="button" class="rounded-md px-2 py-1 text-xs hover:bg-accent" onclick={() => (active = entry)}>Diff</button>
              {/if}
            </td>
          </tr>
        {:else}
          <tr><td colspan="5" class="p-8 text-center text-sm text-muted-foreground">No matching events.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if active}
    <aside class="rounded-xl border bg-card p-4 shadow-sm" aria-label="Audit event diff">
      <div class="flex items-start justify-between gap-3">
        <div><h3 class="font-semibold">{active.action}</h3><p class="text-xs text-muted-foreground">{active.actor} → {active.target}</p></div>
        <button type="button" class="rounded-md px-2 py-1 text-xs hover:bg-accent" onclick={() => (active = null)}>Close</button>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div><p class="mb-1 text-xs font-medium text-muted-foreground">Before</p><pre class="overflow-auto rounded bg-muted p-2 text-xs">{active.before ?? "—"}</pre></div>
        <div><p class="mb-1 text-xs font-medium text-muted-foreground">After</p><pre class="overflow-auto rounded bg-muted p-2 text-xs">{active.after ?? "—"}</pre></div>
      </div>
    </aside>
  {/if}
</div>
