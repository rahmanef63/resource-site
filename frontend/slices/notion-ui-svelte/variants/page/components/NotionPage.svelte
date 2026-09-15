<script lang="ts">
  import type { Block, BlockType, Page } from "@/features/notion-ui/shared/types";
  import NotionBlock from "./NotionBlock.svelte";
  let { page, readOnly=false, onPageChange, onBlocksChange, onNavigatePage } = $props<{page:Page;readOnly?:boolean;onPageChange?:(patch:Partial<Page>)=>void;onBlocksChange?:(blocks:Block[])=>void;onNavigatePage?:(id:string)=>void}>();
  let dragId=$state<string|null>(null);
  const uid=()=>Math.random().toString(36).slice(2,10);
  function emit(blocks:Block[]){onBlocksChange?.(blocks);}
  function patch(id:string,patch:Partial<Block>){emit(page.blocks.map((b)=>b.id===id?{...b,...patch}:b));}
  function turn(id:string,type:BlockType,extra:Partial<Block>={}){patch(id,{type,text:"",...(type==="todo"?{checked:false}:{}),...(type==="toggle"?{children:[],collapsed:false}:{}),...extra});}
  function addAfter(index:number){const blocks=[...page.blocks];blocks.splice(index+1,0,{id:uid(),type:"paragraph",text:""});emit(blocks);}
  function remove(id:string){if(page.blocks.length<=1)return;emit(page.blocks.filter((b)=>b.id!==id));}
  function move(id:string,delta:number){const blocks=[...page.blocks],from=blocks.findIndex((b)=>b.id===id),to=Math.max(0,Math.min(blocks.length-1,from+delta));if(from<0||from===to)return;blocks.splice(to,0,blocks.splice(from,1)[0]);emit(blocks);}
  function drop(over:string){if(!dragId||dragId===over)return;const blocks=[...page.blocks],from=blocks.findIndex(b=>b.id===dragId),to=blocks.findIndex(b=>b.id===over);if(from<0||to<0)return;blocks.splice(to,0,blocks.splice(from,1)[0]);emit(blocks);dragId=null;}
  let fontClass=$derived(page.font==="serif"?"font-serif":page.font==="mono"?"font-mono":"");
</script>
<section class={`flex h-full min-h-[420px] flex-col overflow-hidden bg-background ${fontClass}`}>
  {#if typeof page.cover==="string" && page.cover}<div class="h-40 shrink-0 overflow-hidden bg-muted"><img src={page.cover} alt="" class="h-full w-full object-cover"/></div>{/if}
  <header class={`mx-auto w-full px-6 pt-8 ${page.fullWidth?"max-w-none":"max-w-3xl"}`}>
    <div class="mb-2 text-4xl">{page.icon||"📄"}</div>
    <input class="w-full bg-transparent text-3xl font-bold outline-none" value={page.title} disabled={readOnly} oninput={(e)=>onPageChange?.({title:e.currentTarget.value})}/>
  </header>
  <div class="flex-1 overflow-y-auto"><div class={`mx-auto w-full px-6 py-5 ${page.fullWidth?"max-w-none":"max-w-3xl"} ${page.smallText?"text-sm":""}`}>
    <div role="list">{#each page.blocks as block,index (block.id)}
      <div role="listitem" draggable={!readOnly} ondragstart={()=>dragId=block.id} ondragover={(e)=>e.preventDefault()} ondrop={()=>drop(block.id)}>
        <NotionBlock {block} {index} total={page.blocks.length} {readOnly} onUpdate={(p)=>patch(block.id,p)} onTypeChange={(t,p)=>turn(block.id,t,p)} onAddAfter={()=>addAfter(index)} onDelete={()=>remove(block.id)} onMove={(d)=>move(block.id,d)} {onNavigatePage}/>
      </div>
    {/each}</div>
    {#if !readOnly}<button class="mt-3 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted" onclick={()=>addAfter(page.blocks.length-1)}>+ Add block</button>{/if}
  </div></div>
</section>
