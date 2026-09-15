<script lang="ts">
  import type { Block, BlockType } from "@/features/notion-ui/shared/block-core";
  import { decideBlockInput } from "@/features/notion-ui/variants/page/lib/blockInputHandler";
  import SlashMenu from "./SlashMenu.svelte";
  import SpecialBlock from "./SpecialBlock.svelte";
  let { block, index, total, readOnly=false, onUpdate, onTypeChange, onAddAfter, onDelete, onMove, onNavigatePage } = $props<{block:Block;index:number;total:number;readOnly?:boolean;onUpdate:(patch:Partial<Block>)=>void;onTypeChange:(type:BlockType,patch?:Partial<Block>)=>void;onAddAfter:()=>void;onDelete:()=>void;onMove:(delta:number)=>void;onNavigatePage?:(id:string)=>void}>();
  let slashOpen=$state(false), query=$state("");
  const textTypes=new Set<BlockType>(["paragraph","h1","h2","h3","h4","h5","h6","todo","bullet","numbered","quote","callout"]);
  let isText=$derived(textTypes.has(block.type));
  function input(value:string){const d=decideBlockInput({text:value,blockType:block.type,canTurnInto:!readOnly,slashOpen}); if(d.kind==="markdownTrigger"){onTypeChange(d.type,{text:"",...(d.patch??{})});slashOpen=false;return;} if(d.kind==="slashOpen"){slashOpen=true;query=d.query;} else if(d.kind==="slashClose")slashOpen=false; onUpdate({text:value});}
  function choose(type:BlockType){slashOpen=false;query="";onTypeChange(type,{text:""});}
</script>
<div class="group relative flex gap-1 py-0.5" data-block-id={block.id}>
  {#if !readOnly}<div class="flex w-7 shrink-0 flex-col items-center pt-1 opacity-0 transition group-hover:opacity-100"><button class="text-[10px]" onclick={()=>onMove(-1)} disabled={index===0} aria-label="Move up">↑</button><button class="text-[10px]" onclick={()=>onMove(1)} disabled={index===total-1} aria-label="Move down">↓</button></div>{/if}
  <div class="relative min-w-0 flex-1">
    {#if isText}
      <div class={`flex items-start gap-2 ${block.type==="quote"?"border-l-2 pl-3":""} ${block.type==="callout"?"rounded-lg border bg-muted/30 p-2":""}`}>
        {#if block.type==="todo"}<input type="checkbox" checked={block.checked} disabled={readOnly} onchange={(e)=>onUpdate({checked:e.currentTarget.checked})}/>{:else if block.type==="bullet"}<span>•</span>{:else if block.type==="numbered"}<span>{index+1}.</span>{/if}
        <textarea class={`field-sizing-content min-h-7 w-full resize-none bg-transparent outline-none ${block.type==="h1"?"text-3xl font-bold":block.type==="h2"?"text-2xl font-semibold":block.type==="h3"?"text-xl font-semibold":block.type.startsWith("h")?"text-lg font-medium":"text-sm"}`} value={block.text} placeholder={block.type==="paragraph"?"Write, or press / for commands":block.type} disabled={readOnly} oninput={(e)=>input(e.currentTarget.value)} onkeydown={(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onAddAfter();} if(e.key==="Backspace"&&block.text===""&&total>1){e.preventDefault();onDelete();} if(e.key==="Escape")slashOpen=false;}}></textarea>
      </div>
    {:else}<SpecialBlock {block} {readOnly} {onUpdate} {onNavigatePage}/>{/if}
    {#if slashOpen}<SlashMenu {query} onSelect={choose} onClose={()=>slashOpen=false}/>{/if}
  </div>
  {#if !readOnly}<button class="mt-1 size-6 shrink-0 rounded text-xs opacity-0 hover:bg-muted group-hover:opacity-100" onclick={onDelete} aria-label="Delete block">×</button>{/if}
</div>
