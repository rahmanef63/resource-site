# selection — Svelte 5 / SvelteKit

Install explicitly with:

```sh
npx rr add selection --framework sveltekit
```

The default `npx rr add selection` remains the canonical React/Next distribution. The Svelte variant preserves the same selection model, keyboard actions, edge selection, range/toggle semantics, and AutoCAD-style marquee without React, react-dom, lucide-react, or React shadcn dependencies.

```svelte
<script lang="ts">
  import { SelectionProvider, SelectableBlock, SelectionMarquee } from "$lib/slices/selection";
  let surface: HTMLElement | null = $state(null);
  let ids = $derived(rows.map((row) => row.id));
</script>

<SelectionProvider onBulkDelete={(selected) => removeRows(selected)}>
  <div class="relative" bind:this={surface}>
    {#each rows as row (row.id)}
      <SelectableBlock id={row.id} orderedIds={ids}>{row.title}</SelectableBlock>
    {/each}
    <SelectionMarquee container={surface} />
  </div>
</SelectionProvider>
```

## Behavior parity

- Click an item edge to select it; Shift selects a contiguous range, Cmd/Ctrl toggles.
- Drag right for window/enclosed selection; drag left for crossing/intersection selection.
- Shift/Cmd/Ctrl marquee unions with the existing baseline selection.
- Escape and empty-surface clicks clear selection; Backspace/Delete call `onBulkDelete` and clear.
- Selected items expose `data-block-selected` and a visual ring; the floating toolbar offers Duplicate (when configured), Delete, and Clear.
- Touch pointer drags are ignored so mobile scrolling remains native.
