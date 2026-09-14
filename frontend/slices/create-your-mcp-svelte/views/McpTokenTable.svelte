<script lang="ts">
  import {
    formatTime,
    statusOf,
    type McpTokenRow,
  } from "../../create-your-mcp/views/mcp-admin-helpers";

  let {
    rows,
    onRevoke,
  }: {
    rows: McpTokenRow[] | undefined;
    onRevoke: (id: string, label: string) => Promise<void> | void;
  } = $props();

  const statusClass = (status: ReturnType<typeof statusOf>) =>
    status === "active"
      ? "bg-foreground text-background"
      : "bg-muted text-muted-foreground";

  async function revoke(row: McpTokenRow) {
    const label = row.label ?? row.clientId;
    if (!globalThis.confirm?.(`Revoke token "${label}"? Apps using it will lose access on the next call.`)) return;
    await onRevoke(row._id, label);
  }
</script>

{#if rows === undefined}
  <div class="rounded-lg border-2 border-foreground p-6 text-sm text-muted-foreground">Loading…</div>
{:else if rows.length === 0}
  <div class="rounded-lg border-2 border-foreground p-8 text-center text-muted-foreground">
    No tokens yet. Connect an AI client to mint the first one.
  </div>
{:else}
  <div class="overflow-x-auto rounded-lg border-2 border-foreground">
    <table class="w-full text-sm">
      <thead class="bg-foreground text-background">
        <tr>
          {#each ["Status", "Label / Client", "Created", "Last used", "Expires", ""] as label}
            <th class="px-3 py-3 text-left text-[10px] font-medium uppercase tracking-widest">{label}</th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y-2 divide-foreground">
        {#each rows as row (row._id)}
          {@const status = statusOf(row)}
          <tr class="align-top">
            <td class="px-3 py-3">
              <span class={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest ${statusClass(status)}`}>
                {status}
              </span>
            </td>
            <td class="px-3 py-3">
              <div class="font-medium">{row.label ?? "—"}</div>
              <div class="font-mono text-xs text-muted-foreground">{row.clientId}</div>
              {#if row.scope}<div class="mt-0.5 text-[10px] text-muted-foreground">scope: {row.scope}</div>{/if}
            </td>
            <td class="px-3 py-3 text-xs tabular-nums text-muted-foreground">{formatTime(row.createdAt)}</td>
            <td class="px-3 py-3 text-xs tabular-nums text-muted-foreground">{formatTime(row.lastUsedAt)}</td>
            <td class="px-3 py-3 text-xs tabular-nums text-muted-foreground">{formatTime(row.expiresAt)}</td>
            <td class="px-3 py-3 text-right">
              {#if status === "active"}
                <button
                  type="button"
                  class="border-2 border-destructive px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-destructive hover:bg-destructive hover:text-background"
                  onclick={() => void revoke(row)}
                >Revoke</button>
              {:else}
                <span class="text-[10px] text-muted-foreground">—</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
