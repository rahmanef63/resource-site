<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import CanvasStage from "./CanvasStage.svelte";
  import SidePanel from "./SidePanel.svelte";
  import ExportPanel from "./ExportPanel.svelte";
  import { createStudioStore } from "@/features/design-studio/lib/studio-core";
  import { createSceneStore } from "@/features/design-studio/lib/scene-core";
  import { EMOJIS, TOOL_META, type Layer, type LayerKind, type ToolId } from "@/features/design-studio/lib/model-core";
  import type { Adjustments } from "@/features/design-studio/lib/filters";
  import { nextImageSource } from "@/features/design-studio/lib/host-core";
  import { parseDoc } from "@/features/design-studio/lib/serialize";

  let { payload }: { payload?: unknown } = $props();
  const studio = createStudioStore();
  const scene = createSceneStore();
  let state = $state(studio.getSnapshot());
  let view = $state(scene.getSnapshot());
  let exportOpen = $state(false);
  let selectedLayer = $derived(state.layers.find((layer) => layer.id === state.selected));

  onMount(() => {
    const offStudio = studio.subscribe(() => (state = studio.getSnapshot()));
    const offScene = scene.subscribe(() => (view = scene.getSnapshot()));
    const doc = (payload as { doc?: string } | undefined)?.doc;
    if (doc) { const parsed = parseDoc(doc); if (parsed) applyImport(parsed); }
    return () => { offStudio(); offScene(); };
  });
  onDestroy(() => scene.destroy());

  function applyImport(result: { layers: Layer[]; aspect?: string; adjustments?: Adjustments }) {
    studio.loadLayers(result.layers);
    if (result.aspect) scene.setAspect(result.aspect);
    if (result.adjustments) studio.setAdjustments(result.adjustments);
  }
  function add(kind: LayerKind) {
    studio.add(kind, kind === "image" ? { src: nextImageSource() } : {});
  }
  function pickEmoji(emoji: string) {
    studio.add("sticker", { emoji }); scene.setEmojiOpen(false);
  }
  function selectTool(tool: ToolId) {
    if (tool === "sticker") scene.setEmojiOpen((value) => !value);
    else { scene.setTool(tool); scene.setEmojiOpen(false); }
  }
  function key(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.matches("input,textarea,select,[contenteditable=true]")) return;
    const k = event.key.toLowerCase();
    const tool = TOOL_META.find((item) => item.key.toLowerCase() === k);
    if (tool) { event.preventDefault(); selectTool(tool.id); return; }
    if ((event.ctrlKey || event.metaKey) && k === "z") { event.preventDefault(); event.shiftKey ? studio.redo() : studio.undo(); return; }
    if ((event.ctrlKey || event.metaKey) && k === "y") { event.preventDefault(); studio.redo(); return; }
    if ((event.key === "Delete" || event.key === "Backspace") && state.selected) { event.preventDefault(); studio.remove(state.selected); }
    if (event.key === "Escape") { scene.setEmojiOpen(false); studio.setSelected(null); }
  }
</script>

<svelte:window onkeydown={key} />
<div class="relative flex h-full min-h-[520px] w-full flex-col overflow-hidden bg-background text-foreground">
  <header class="flex h-11 shrink-0 items-center gap-2 border-b bg-card px-3">
    <strong class="mr-2 text-sm">Design Studio</strong>
    <button type="button" class="rounded-md border px-2 py-1 text-xs disabled:opacity-40" disabled={!state.canUndo} onclick={studio.undo}>Undo</button>
    <button type="button" class="rounded-md border px-2 py-1 text-xs disabled:opacity-40" disabled={!state.canRedo} onclick={studio.redo}>Redo</button>
    <div class="ml-auto flex items-center gap-2">
      <button type="button" class="rounded-md border px-2 py-1 text-xs" onclick={() => scene.setPanelOpen((value) => !value)}>{view.panelOpen ? "Hide panel" : "Show panel"}</button>
      <button type="button" class="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground" onclick={() => (exportOpen = true)}>Export</button>
    </div>
  </header>

  <div class="flex min-h-0 flex-1">
    <nav class="relative flex w-16 shrink-0 flex-col gap-1 border-r bg-card p-2" aria-label="Design tools">
      {#each TOOL_META as tool (tool.id)}
        <button type="button" class={`rounded-lg px-1 py-2 text-[10px] ${view.tool === tool.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`} title={`${tool.label} (${tool.key})`} onclick={() => selectTool(tool.id)}>{tool.label}</button>
      {/each}
      {#if view.emojiOpen}
        <div class="absolute left-full top-2 z-30 grid w-36 grid-cols-4 gap-1 rounded-lg border bg-card p-2 shadow-xl">
          {#each EMOJIS as emoji}<button type="button" class="rounded p-1 text-xl hover:bg-accent" onclick={() => pickEmoji(emoji)}>{emoji}</button>{/each}
        </div>
      {/if}
    </nav>

    <CanvasStage
      adjustments={state.adjustments} layers={state.layers} selected={state.selected} tool={view.tool}
      zoom={view.zoom} aspect={view.aspect} safe={view.safe} platform={view.platform}
      onSelect={studio.setSelected} onPlace={(tool, x, y) => { studio.place(tool, x, y); scene.setTool("move"); }}
      onMove={(id, x, y) => studio.update(id, { x, y })} onDragStart={studio.commit}
    />

    {#if view.panelOpen}
      <div class="w-[270px] shrink-0">
        <SidePanel
          tab={view.tab} layers={state.layers} selected={state.selected} {selectedLayer}
          adjustments={state.adjustments} activeFilter={state.activeFilter} aspect={view.aspect} safe={view.safe} platform={view.platform}
          onTab={scene.setTab} onSelect={(id) => studio.setSelected(id)} onToggle={studio.toggle} onMove={studio.reorder}
          onDelete={studio.remove} onRename={(id, name) => studio.update(id, { name })} onAdd={add}
          onUpdate={(patch) => state.selected && studio.update(state.selected, patch)} onAdjust={studio.adjust}
          onFilter={studio.applyFilter} onAspect={scene.setAspect} onReset={studio.resetAdjust}
          onSafe={scene.setSafe} onPlatform={scene.setPlatform}
        />
      </div>
    {/if}
  </div>

  <footer class="flex h-9 shrink-0 items-center gap-3 border-t bg-card px-3 text-xs text-muted-foreground">
    <span>{view.aspect.replace(" / ", ":")}</span><span>{state.layers.length} layers</span>
    <label class="ml-auto flex items-center gap-2">Zoom <input type="range" min="50" max="160" value={view.zoom} oninput={(event) => scene.setZoom(Number(event.currentTarget.value))} /><span class="w-10 text-right tabular-nums">{view.zoom}%</span></label>
  </footer>

  {#if view.status}<div class="absolute bottom-12 left-1/2 z-30 -translate-x-1/2 rounded-full border bg-card px-3 py-1 text-xs shadow-md">{view.status}</div>{/if}
  {#if exportOpen}<ExportPanel layers={state.layers} aspect={view.aspect} adjustments={state.adjustments} onClose={() => (exportOpen = false)} onImport={applyImport} notify={scene.notify} />{/if}
</div>
