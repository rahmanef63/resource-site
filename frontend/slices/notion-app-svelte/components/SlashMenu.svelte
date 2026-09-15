<script lang="ts">
  import { searchBlocks } from "@notion/slices/editor/lib/block-catalog";
  import type { BlockType } from "@notion/shared/types";
  let { query = "", onSelect, onClose } = $props<{ query?: string; onSelect: (type: BlockType) => void; onClose: () => void }>();
  let items = $derived(searchBlocks(query).slice(0, 12));
</script>
<div class="absolute left-0 top-full z-30 mt-1 w-72 rounded-xl border bg-background p-1 shadow-xl" role="menu" aria-label="Block types">
  {#each items as item (item.type)}
    <button class="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted" type="button" role="menuitem" onclick={() => onSelect(item.type)}>
      <span class="mt-0.5 grid size-7 place-items-center rounded-md border text-xs font-semibold">{item.label.slice(0, 1)}</span>
      <span><span class="block text-sm font-medium">{item.label}</span><span class="block text-xs text-muted-foreground">{item.hint}</span></span>
    </button>
  {:else}
    <p class="px-3 py-4 text-sm text-muted-foreground">No matching block.</p>
  {/each}
  <button class="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted" type="button" onclick={onClose}>Close</button>
</div>
