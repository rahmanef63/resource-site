<script lang="ts">
  import type { Block, BlockType } from "@notion/shared/types";
  import { buildTurnIntoPatch } from "@notion/slices/editor/lib/turnInto";
  import type { PageEditorCore } from "@notion/slices/editor/lib/page-core";
  import TextBlock from "./TextBlock.svelte";
  import SpecialBlock from "./SpecialBlock.svelte";
  import SlashMenu from "./SlashMenu.svelte";
  let { block, index, total, core, readonly = false, onDragStart, onDrop, onNavigate } = $props<{
    block: Block; index: number; total: number; core: PageEditorCore; readonly?: boolean;
    onDragStart: (id: string) => void; onDrop: (id: string) => void; onNavigate?: (pageId: string) => void;
  }>();
  let slashOpen = $state(false), slashQuery = $state("");
  let textLike = $derived(["paragraph","h1","h2","h3","h4","h5","h6","todo","bullet","numbered","quote","callout"].includes(block.type));
  async function choose(type: BlockType) {
    slashOpen=false; slashQuery="";
    if(type==="page") { await core.createChild(block.id); return; }
    const patch=buildTurnIntoPatch(type);
    if(type.startsWith("columns")) patch.columns=Array.from({length:Number(type.slice(-1))},()=>[]);
    await core.updateBlock(block.id,patch);
  }
</script>
<div role="listitem" class="group relative flex gap-1 rounded-md px-1 py-0.5 hover:bg-muted/30" ondragover={(e)=>e.preventDefault()} ondrop={()=>onDrop(block.id)}>
  {#if !readonly}
    <div class="flex w-8 shrink-0 items-start pt-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      <button type="button" draggable="true" class="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted" aria-label="Drag block" ondragstart={()=>onDragStart(block.id)}>⋮⋮</button>
      <button type="button" class="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted" aria-label="Block menu" onclick={()=>{slashOpen=!slashOpen;slashQuery=""}}>+</button>
    </div>
  {:else}<div class="w-2 shrink-0"></div>{/if}
  <div class="relative min-w-0 flex-1">
    {#if textLike}<TextBlock {block} {index} {total} {core} {readonly} onSlash={(open,q)=>{slashOpen=open;slashQuery=q}} />
    {:else}<SpecialBlock {block} {core} {readonly} {onNavigate} />{/if}
    {#if slashOpen && !readonly}<SlashMenu query={slashQuery} onSelect={choose} onClose={()=>slashOpen=false}/>{/if}
  </div>
  {#if !readonly}
    <div class="flex shrink-0 items-start gap-0.5 pt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
      <button class="size-6 rounded text-xs hover:bg-muted" type="button" aria-label="Move up" disabled={index===0} onclick={()=>core.move(block.id,-1)}>↑</button>
      <button class="size-6 rounded text-xs hover:bg-muted" type="button" aria-label="Move down" disabled={index===total-1} onclick={()=>core.move(block.id,1)}>↓</button>
      <button class="size-6 rounded text-xs hover:bg-muted" type="button" aria-label="Duplicate" onclick={()=>core.duplicateBlock(block.id)}>⧉</button>
      <button class="size-6 rounded text-xs hover:bg-destructive/10 hover:text-destructive" type="button" aria-label="Delete" onclick={()=>core.deleteBlock(block.id)}>×</button>
    </div>
  {/if}
</div>
