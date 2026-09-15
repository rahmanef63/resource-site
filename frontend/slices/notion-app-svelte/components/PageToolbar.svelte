<script lang="ts">
  import type { PageEditorCore, PageEditorSnapshot } from "@notion/slices/editor/lib/page-core";
  let { core, snapshot, readonly = false } = $props<{ core: PageEditorCore; snapshot: PageEditorSnapshot; readonly?: boolean }>();
  let fileInput: HTMLInputElement | undefined;
  function attachFile(node: HTMLInputElement){fileInput=node;return()=>{if(fileInput===node)fileInput=undefined;};}
  function download() {
    const blob=new Blob([core.exportMarkdown()],{type:"text/markdown;charset=utf-8"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url;a.download=`${snapshot.page?.title||"page"}.md`;a.click();URL.revokeObjectURL(url);
  }
  async function importFile(file?: File) { if(file) await core.importMarkdown(await file.text()); }
</script>
<div class="flex flex-wrap items-center gap-1 border-b px-3 py-2 text-xs">
  <button class="rounded-md border px-2 py-1 hover:bg-muted disabled:opacity-40" type="button" disabled={readonly||!snapshot.canUndo} onclick={()=>core.undo()}>Undo</button>
  <button class="rounded-md border px-2 py-1 hover:bg-muted disabled:opacity-40" type="button" disabled={readonly||!snapshot.canRedo} onclick={()=>core.redo()}>Redo</button>
  <span class="mx-1 h-4 w-px bg-border"></span>
  <button class="rounded-md border px-2 py-1 hover:bg-muted" type="button" onclick={download}>Export MD</button>
  {#if !readonly}<button class="rounded-md border px-2 py-1 hover:bg-muted" type="button" onclick={()=>fileInput?.click()}>Import MD</button>{/if}
  <span class="ml-auto text-muted-foreground">{snapshot.page?.blocks.length??0} blocks</span>
  <input class="hidden" type="file" accept=".md,.markdown,text/markdown,text/plain" {@attach attachFile} onchange={(e)=>{void importFile(e.currentTarget.files?.[0]);e.currentTarget.value=""}}/>
</div>
