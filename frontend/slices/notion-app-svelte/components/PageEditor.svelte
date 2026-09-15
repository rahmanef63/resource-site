<script lang="ts">
  import { onMount, untrack } from "svelte";
  import type { Page } from "@notion/shared/types";
  import { NOOP_DATA_ADAPTER, type EditorDataAdapter } from "@notion/slices/editor/lib/dataAdapter";
  import { createPageEditorCore } from "@notion/slices/editor/lib/page-core";
  import { notionTools, type NotionToolsCtx } from "@/features/notion-app/lib/tools";
  import BlockRow from "./BlockRow.svelte";
  import PageToolbar from "./PageToolbar.svelte";

  type RegisterTools = (collection: typeof notionTools, ctx: NotionToolsCtx) => void | (() => void);
  let { pageId, data = undefined, initialPage = undefined, readonly = false, onChange = undefined, onNavigate = undefined, registerTools = undefined } = $props<{
    pageId: string; data?: EditorDataAdapter; initialPage?: Page; readonly?: boolean;
    onChange?: (page: Page) => void; onNavigate?: (pageId: string) => void; registerTools?: RegisterTools;
  }>();
  const activeData = untrack(()=>data ?? NOOP_DATA_ADAPTER);
  const core = createPageEditorCore({ pageId: untrack(()=>pageId), data: activeData, initialPage: untrack(()=>initialPage), onChange: (next)=>onChange?.(next) });
  let snapshot = $state(core.getSnapshot());
  let dragged = $state<string | null>(null);
  let page = $derived(snapshot.page);
  async function drop(overId: string) {
    if(!dragged || !page || dragged===overId) return;
    const ids=page.blocks.map((b)=>b.id), from=ids.indexOf(dragged), to=ids.indexOf(overId);
    if(from<0||to<0)return; ids.splice(to,0,ids.splice(from,1)[0]); dragged=null; await core.reorder(ids);
  }
  onMount(()=>{
    const unsubscribe=core.subscribe((next)=>snapshot=next);
    const toolsCtx: NotionToolsCtx={
      createPage: async(title)=>{const out=await activeData.createPage(null,{title});return out.id;},
      getPage: async(id)=>JSON.stringify(activeData.getPage(id)??null),
      updatePage: async(id,patch)=>{await activeData.updatePage(id,patch);return `updated ${id}`;},
      search: async(query)=>activeData.pages.filter((p)=>`${p.title} ${p.previewText??""}`.toLowerCase().includes(query.toLowerCase())).slice(0,20).map((p)=>`${p.id} ${p.title}`).join("\n")||"no matches",
    };
    const unregister=registerTools?.(notionTools,toolsCtx);
    return()=>{unsubscribe();unregister?.();};
  });
</script>
<div class="flex h-full min-h-[420px] w-full flex-col overflow-hidden rounded-xl border bg-background text-foreground">
  <PageToolbar {core} {snapshot} {readonly}/>
  {#if page}
    <div class="min-h-0 flex-1 overflow-y-auto">
      <article class="mx-auto w-full max-w-4xl px-6 py-8 sm:px-10">
        <div class="mb-6 flex items-start gap-3">
          <span class="mt-1 text-3xl" aria-hidden="true">{page.icon||"📄"}</span>
          <input class="min-w-0 flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground" value={page.title} placeholder="Untitled" disabled={readonly} onchange={(e)=>core.updateTitle(e.currentTarget.value)}/>
        </div>
        <div role="list" class="grid gap-0.5">
          {#each page.blocks as block, index (block.id)}
            <BlockRow {block} {index} total={page.blocks.length} {core} {readonly} onDragStart={(id)=>dragged=id} onDrop={drop} {onNavigate}/>
          {/each}
        </div>
        {#if !readonly}<button type="button" class="mt-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted" onclick={()=>core.addBlock(page.blocks.length-1)}>+ Add block</button>{/if}
      </article>
    </div>
  {:else}
    <div class="grid flex-1 place-items-center p-8 text-center"><div><p class="font-medium">Page not found</p><p class="mt-1 text-sm text-muted-foreground">Provide initialPage or an EditorDataAdapter that resolves {pageId}.</p></div></div>
  {/if}
</div>
