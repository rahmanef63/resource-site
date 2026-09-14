<script lang="ts">
  import {
    BLOCK_KIND_LABEL,
    PAGE_BLOCK_KINDS,
    type PageBlock,
    type PageBlockKind,
  } from "../../pages-cms/types";
  import BlockEditor from "./BlockEditor.svelte";

  let {
    blocks,
    addKind,
    setAddKind,
    onAdd,
    onPatch,
    onRemove,
    onMoveUp,
    onMoveDown,
  }: {
    blocks: PageBlock[];
    addKind: PageBlockKind;
    setAddKind: (kind: PageBlockKind) => void;
    onAdd: () => void;
    onPatch: (index: number, next: PageBlock) => void;
    onRemove: (index: number) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
  } = $props();
</script>

<div class="space-y-3">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="text-base font-semibold">Blocks ({blocks.length})</h2>
    <div class="flex items-center gap-2">
      <select class="h-9 rounded-md border bg-background px-3 text-xs" value={addKind} onchange={(e) => setAddKind(e.currentTarget.value as PageBlockKind)}>
        {#each PAGE_BLOCK_KINDS as kind}<option value={kind}>{BLOCK_KIND_LABEL[kind]}</option>{/each}
      </select>
      <button class="h-9 rounded-md bg-foreground px-3 text-xs font-medium text-background" type="button" onclick={onAdd}>+ Add block</button>
    </div>
  </div>

  {#if blocks.length === 0}
    <div class="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-xs text-muted-foreground">No blocks yet. Pick a kind and add the first block.</div>
  {/if}

  {#each blocks as block, i}
    <div class="grid gap-2 sm:grid-cols-[36px_1fr]">
      <div class="flex gap-1 sm:flex-col">
        <button class="size-8 rounded border text-xs disabled:opacity-30" type="button" disabled={i === 0} onclick={() => onMoveUp(i)} aria-label="Move block up">↑</button>
        <button class="size-8 rounded border text-xs disabled:opacity-30" type="button" disabled={i === blocks.length - 1} onclick={() => onMoveDown(i)} aria-label="Move block down">↓</button>
      </div>
      <BlockEditor {block} onChange={(next) => onPatch(i, next)} onRemove={() => onRemove(i)} />
    </div>
  {/each}
</div>
