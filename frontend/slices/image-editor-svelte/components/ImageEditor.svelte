<script lang="ts">
  import { onMount } from "svelte";
  import type { EditorToolCollection } from "@/features/image-editor/commands/types";
  import { imageEditorTools } from "@/features/image-editor/commands/registry";
  import { createBrowserEditor, type EditorSnapshot } from "@/features/image-editor/lib/editor-core";
  import { loadAutosave, saveAutosave } from "@/features/image-editor/lib/project-core";
  import type { ImageEditorAssistantRunner } from "@/features/image-editor/lib/assistant-core";
  import CanvasStage from "./CanvasStage.svelte";
  import TopBar from "./TopBar.svelte";
  import ToolRail from "./ToolRail.svelte";
  import BrushPanel from "./BrushPanel.svelte";
  import LayersPanel from "./LayersPanel.svelte";
  import PropertiesPanel from "./PropertiesPanel.svelte";
  import AiPanel from "./AiPanel.svelte";

  type RegisterTools = (collection: EditorToolCollection, context: ReturnType<typeof createBrowserEditor>) => void | (() => void);
  let { runAssistant = undefined, registerTools = undefined } = $props<{ runAssistant?: ImageEditorAssistantRunner; registerTools?: RegisterTools }>();
  const editor = createBrowserEditor();
  let snapshot = $state<EditorSnapshot>(editor.getSnapshot());
  let panel = $state<"properties" | "layers" | "ai">("properties");
  let autosaveTimer: ReturnType<typeof setTimeout> | undefined;

  function shortcut(event: KeyboardEvent) {
    const target=event.target as HTMLElement | null;
    if(target && ["INPUT","TEXTAREA","SELECT"].includes(target.tagName)) return;
    const mod=event.metaKey||event.ctrlKey, key=event.key.toLowerCase();
    if(mod&&key==="z"){event.preventDefault();event.shiftKey?editor.redo():editor.undo();return;}
    if(mod&&key==="y"){event.preventDefault();editor.redo();return;}
    if((event.key==="Delete"||event.key==="Backspace")&&snapshot.selectedId){event.preventDefault();editor.removeLayer(snapshot.selectedId);return;}
    const tools:Record<string,typeof snapshot.tool>={v:"move",b:"brush",e:"eraser",h:"hand",i:"eyedropper"};
    if(tools[key]){event.preventDefault();editor.setTool(tools[key]);}
    if(key==="+"||key==="=")editor.setZoom(Math.min(6,snapshot.zoom*1.2));
    if(key==="-")editor.setZoom(Math.max(.08,snapshot.zoom*.83));
  }

  onMount(() => {
    const saved=loadAutosave(); if(saved) editor.loadProject(saved);
    const sync=()=>{
      snapshot=editor.getSnapshot();
      if(autosaveTimer) clearTimeout(autosaveTimer);
      autosaveTimer=setTimeout(()=>saveAutosave(editor.exportProject()),700);
    };
    const unsubscribe=editor.subscribe(sync); sync();
    const unregister=registerTools?.(imageEditorTools,editor);
    return()=>{if(autosaveTimer)clearTimeout(autosaveTimer);unsubscribe();unregister?.();};
  });
</script>

<svelte:window onkeydown={shortcut} />
<div class="flex h-full min-h-[560px] flex-col overflow-hidden rounded-xl border bg-background text-foreground">
  <TopBar {editor} {snapshot} onAi={()=>panel="ai"}/>
  <div class="flex min-h-0 flex-1">
    <ToolRail {editor} {snapshot}/>
    <section class="flex min-w-0 flex-1 flex-col">
      {#if snapshot.tool==="brush"||snapshot.tool==="eraser"||snapshot.maskEditId}<BrushPanel {editor} {snapshot}/>{/if}
      <CanvasStage {editor}/>
      <footer class="flex items-center gap-3 border-t px-3 py-1 text-[10px] text-muted-foreground"><span>{snapshot.doc.width}×{snapshot.doc.height}</span><span>{snapshot.doc.layers.length} layers</span><span class="capitalize">{snapshot.tool}</span><span class="ml-auto">{Math.round(snapshot.zoom*100)}%</span></footer>
    </section>
    <aside class="flex w-80 shrink-0 flex-col border-l max-lg:w-64 max-md:absolute max-md:inset-y-12 max-md:right-0 max-md:z-30 max-md:bg-background max-md:shadow-xl">
      <div class="grid grid-cols-3 gap-1 border-b p-1">{#each ["properties","layers","ai"] as item (item)}<button class={`rounded px-2 py-1 text-xs capitalize ${panel===item?"bg-muted font-medium":""}`} onclick={()=>panel=item as typeof panel}>{item}</button>{/each}</div>
      <div class="min-h-0 flex-1 overflow-hidden">{#if panel==="properties"}<PropertiesPanel {editor} {snapshot}/>{:else if panel==="layers"}<LayersPanel {editor} {snapshot}/>{:else}<AiPanel {editor} runner={runAssistant}/>{/if}</div>
    </aside>
  </div>
</div>
