<script lang="ts">
  import type { PageRow } from "@/features/html-studio/lib/core";
  let { rows, slug, onOpen, onRemove }: {
    rows: PageRow[]; slug: string | null; onOpen: (slug: string) => void; onRemove: (slug: string) => void;
  } = $props();
</script>

<aside class="flex w-56 shrink-0 flex-col border-r border-border bg-card">
  <div class="border-b border-border px-3 py-2 text-xs font-semibold">Saved</div>
  <div class="min-h-0 flex-1 overflow-y-auto p-1.5">
    {#if rows.length === 0}
      <p class="px-2 py-2 text-[11px] text-muted-foreground">No pages yet.</p>
    {:else}
      <ul>
        {#each rows as row (row.slug)}
          <li class:bg-accent={row.slug === slug} class="group flex items-center gap-1 rounded">
            <button type="button" class="min-w-0 flex-1 px-1.5 py-1 text-left hover:bg-accent" onclick={() => onOpen(row.slug)}>
              <span class="block truncate text-xs">{row.visibility === "private" ? "🔒 " : ""}{row.title}</span>
              <span class="block truncate font-mono text-[10px] text-muted-foreground">/p/{row.slug}</span>
            </button>
            <button type="button" class="size-7 shrink-0 text-xs text-muted-foreground hover:text-destructive" aria-label={`Delete ${row.title}`} onclick={() => onRemove(row.slug)}>×</button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</aside>
