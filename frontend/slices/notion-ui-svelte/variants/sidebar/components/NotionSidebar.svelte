<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import type { NotionSidebarPage } from "@/features/notion-ui/variants/sidebar/lib/types-core";
  import { flatten, removeDescendantsOf, getProjection, beforeIdAfterDrop } from "@/features/notion-ui/variants/sidebar/lib/tree";
  let { pages, activeId=undefined, label="Pages", onSelect, onCreate, onRename, onDelete, onMove, onIconChange } = $props<{pages:NotionSidebarPage[];activeId?:string;label?:string;onSelect?:(id:string)=>void;onCreate?:(parentId:string|null)=>void;onRename?:(id:string,title:string)=>void;onDelete?:(id:string)=>void;onMove?:(id:string,parentId:string|null,beforeId:string|null)=>void;onIconChange?:(id:string,icon:string)=>void}>();
  let collapsed=new SvelteSet<string>(), editing=$state<string|null>(null), dragId=$state<string|null>(null), dragX=$state(0);
  let all=$derived(flatten(pages));
  let visible=$derived(removeDescendantsOf(all,[...collapsed,...(dragId?[dragId]:[])]));
  function toggle(id:string){collapsed.has(id)?collapsed.delete(id):collapsed.add(id);}
  function drop(e:DragEvent,overId:string){if(!dragId||!onMove)return;const p=getProjection(visible,dragId,overId,e.clientX-dragX);onMove(dragId,p.parentId,beforeIdAfterDrop(visible,dragId,overId,p.parentId));dragId=null;}
</script>
<aside class="flex h-full min-h-72 w-64 flex-col border-r bg-card/40 p-2">
  <div class="flex items-center justify-between px-2 py-1"><span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>{#if onCreate}<button class="grid size-6 place-items-center rounded hover:bg-muted" onclick={()=>onCreate?.(null)} aria-label="Add page">+</button>{/if}</div>
  <ul class="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
    {#each visible as item (item.id)}
      <li draggable={!!onMove} ondragstart={(e)=>{dragId=item.id;dragX=e.clientX;}} ondragover={(e)=>e.preventDefault()} ondrop={(e)=>drop(e,item.id)}>
        <div class={`group flex min-h-8 items-center gap-1 rounded-md px-1 text-sm ${activeId===item.id?"bg-muted font-medium":"hover:bg-muted/60"}`} style={`padding-left:${4+item.depth*16}px`}>
          <button class="size-5 shrink-0 text-xs" onclick={()=>item.childCount&&toggle(item.id)} aria-label={collapsed.has(item.id)?"Expand":"Collapse"}>{item.childCount?(collapsed.has(item.id)?"›":"⌄"):""}</button>
          <button class="size-6 shrink-0" onclick={()=>{if(onIconChange){const n=window.prompt("Icon",item.icon);if(n)onIconChange(item.id,n)}}}>{item.icon||"📄"}</button>
          {#if editing===item.id}<input class="min-w-0 flex-1 rounded border bg-background px-1" value={item.title} onblur={(e)=>{onRename?.(item.id,e.currentTarget.value.trim()||"Untitled");editing=null;}} onkeydown={(e)=>{if(e.key==="Enter")e.currentTarget.blur();if(e.key==="Escape")editing=null;}}/>{:else}<button class="min-w-0 flex-1 truncate text-left" onclick={()=>onSelect?.(item.id)} ondblclick={()=>onRename&&(editing=item.id)}>{item.title||"Untitled"}</button>{/if}
          <div class="flex shrink-0 opacity-0 group-hover:opacity-100">{#if onCreate}<button class="size-6 rounded hover:bg-background" onclick={()=>onCreate?.(item.id)} aria-label="Add subpage">+</button>{/if}{#if onDelete}<button class="size-6 rounded hover:bg-background" onclick={()=>onDelete?.(item.id)} aria-label="Delete page">×</button>{/if}</div>
        </div>
      </li>
    {/each}
    {#if visible.length===0}<li class="px-3 py-4 text-xs italic text-muted-foreground">No pages yet</li>{/if}
  </ul>
</aside>
