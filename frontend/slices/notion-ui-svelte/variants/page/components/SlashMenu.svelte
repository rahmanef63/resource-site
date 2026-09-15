<script lang="ts">
  import type { BlockType } from "@/features/notion-ui/shared/block-core";
  import { BLOCK_CATALOG } from "@/features/notion-ui/variants/page/lib/block-catalog";
  let { query = "", onSelect, onClose } = $props<{ query?: string; onSelect: (type: BlockType) => void; onClose?: () => void }>();
  let needle = $derived(query.trim().toLowerCase());
  let items = $derived(BLOCK_CATALOG.filter((item) => !needle || `${item.label} ${item.keywords.join(" ")}`.toLowerCase().includes(needle)).slice(0, 12));
</script>
<div class="absolute left-0 top-full z-40 mt-1 w-72 overflow-hidden rounded-lg border bg-background shadow-lg" role="menu" aria-label="Block types">
  <div class="flex items-center justify-between border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><span>Turn into</span>{#if onClose}<button class="rounded px-1.5 py-0.5 hover:bg-muted" onclick={onClose} aria-label="Close menu">Esc</button>{/if}</div>
  <div class="max-h-72 overflow-y-auto p-1">
    {#each items as item (item.type)}
      <button class="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-muted" onclick={() => onSelect(item.type)} role="menuitem">
        <span class="grid size-8 shrink-0 place-items-center rounded border bg-muted/40 text-xs font-semibold">{item.glyph}</span>
        <span class="min-w-0"><strong class="block text-xs font-medium">{item.label}</strong><span class="block truncate text-[10px] text-muted-foreground">{item.hint}</span></span>
      </button>
    {/each}
    {#if items.length===0}<p class="px-3 py-5 text-center text-xs text-muted-foreground">No matching block.</p>{/if}
  </div>
</div>
