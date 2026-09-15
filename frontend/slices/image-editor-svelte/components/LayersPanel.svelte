<script lang="ts">
  import type { BrowserEditorCore, EditorSnapshot } from "@/features/image-editor/lib/editor-core";
  let { editor, snapshot } = $props<{ editor: BrowserEditorCore; snapshot: EditorSnapshot }>();
  let topFirst = $derived([...snapshot.doc.layers].reverse());
  const glyph=(kind:string)=>({image:"🖼️",text:"T",shape:"◆",paint:"🎨",adjustment:"☼"}[kind]??"◻");
</script>
<section class="flex min-h-0 flex-col border-t">
  <header class="flex items-center border-b px-3 py-2"><strong class="text-xs uppercase tracking-wide text-muted-foreground">Layers</strong><span class="ml-auto text-[10px] text-muted-foreground">{snapshot.doc.layers.length}</span></header>
  <div class="min-h-0 flex-1 overflow-y-auto p-1">
    {#each topFirst as layer (layer.id)}
      <div class={`flex items-center gap-1 rounded hover:bg-muted ${snapshot.selectedId===layer.id?"bg-muted font-medium":""}`}>
        <button class="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left text-xs" onclick={()=>editor.select(layer.id)}>
          <span aria-hidden="true">{glyph(layer.kind)}</span><span class="min-w-0 flex-1 truncate">{layer.name}</span><span class="text-[10px] text-muted-foreground">{Math.round(layer.opacity*100)}%</span>
        </button>
        <button class="rounded px-1 text-[10px]" title={layer.visible?"Hide layer":"Show layer"} aria-label={layer.visible?"Hide layer":"Show layer"} onclick={()=>editor.update(layer.id,{visible:!layer.visible})}>{layer.visible?"👁":"—"}</button>
        <button class="mr-1 rounded px-1 text-[10px]" title={layer.locked?"Unlock layer":"Lock layer"} aria-label={layer.locked?"Unlock layer":"Lock layer"} onclick={()=>editor.update(layer.id,{locked:!layer.locked})}>{layer.locked?"🔒":"🔓"}</button>
      </div>
    {/each}
  </div>
  <footer class="grid grid-cols-4 gap-1 border-t p-1.5">
    <button class="rounded border px-1 py-1 text-[10px] disabled:opacity-30" disabled={!snapshot.selectedId} onclick={()=>snapshot.selectedId&&editor.raise(snapshot.selectedId)}>↑</button>
    <button class="rounded border px-1 py-1 text-[10px] disabled:opacity-30" disabled={!snapshot.selectedId} onclick={()=>snapshot.selectedId&&editor.lower(snapshot.selectedId)}>↓</button>
    <button class="rounded border px-1 py-1 text-[10px] disabled:opacity-30" disabled={!snapshot.selectedId} onclick={()=>snapshot.selectedId&&editor.duplicateLayer(snapshot.selectedId)}>Copy</button>
    <button class="rounded border px-1 py-1 text-[10px] text-destructive disabled:opacity-30" disabled={!snapshot.selectedId} onclick={()=>snapshot.selectedId&&editor.removeLayer(snapshot.selectedId)}>Delete</button>
  </footer>
</section>
