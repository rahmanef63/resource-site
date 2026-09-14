<script lang="ts">
  import { filterStr, type Adjustments } from "@/features/design-studio/lib/filters";
  import { SAFE, type SafePlatform } from "@/features/design-studio/lib/masks";
  import type { Layer, ToolId } from "@/features/design-studio/lib/model-core";
  import LayerView from "./LayerView.svelte";

  let { adjustments, layers, selected, tool, zoom, aspect, safe, platform, onSelect, onPlace, onMove, onDragStart }: {
    adjustments: Adjustments; layers: Layer[]; selected: string | null; tool: ToolId;
    zoom: number; aspect: string; safe: boolean; platform: SafePlatform;
    onSelect: (id: string | null) => void; onPlace: (tool: ToolId, x: number, y: number) => void;
    onMove: (id: string, x: number, y: number) => void; onDragStart: () => void;
  } = $props();
  let frame: HTMLDivElement;
  let dims = $derived(aspect.split("/").map((value) => Number.parseFloat(value)));
  let landscape = $derived(dims[0] >= dims[1]);
  let safeSpec = $derived(SAFE[platform]);
  const clamp = (value: number) => Math.max(-60, Math.min(60, Math.round(value)));
  function relative(clientX: number, clientY: number) {
    const rect = frame.getBoundingClientRect();
    return { x: ((clientX - (rect.left + rect.width / 2)) / rect.width) * 100, y: ((clientY - (rect.top + rect.height / 2)) / rect.height) * 100 };
  }
  function click(event: MouseEvent) {
    if (tool === "move") { if (event.target === event.currentTarget) onSelect(null); return; }
    const point = relative(event.clientX, event.clientY); onPlace(tool, clamp(point.x), clamp(point.y));
  }
  function key(event: KeyboardEvent) {
    if (event.key === "Escape") onSelect(null);
  }
  function down(event: PointerEvent, layer: Layer) {
    event.stopPropagation(); onSelect(layer.id);
    if (tool !== "move" || event.button !== 0) return;
    onDragStart(); const rect = frame.getBoundingClientRect(); const sx = event.clientX; const sy = event.clientY; const ox = layer.x; const oy = layer.y;
    const move = (next: PointerEvent) => onMove(layer.id, clamp(ox + ((next.clientX - sx) / rect.width) * 100), clamp(oy + ((next.clientY - sy) / rect.height) * 100));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  }
</script>

<div class="flex flex-1 items-center justify-center overflow-hidden p-6" style="background-image:repeating-conic-gradient(var(--muted) 0 25%,transparent 0 50%);background-size:22px 22px">
  <div
    bind:this={frame}
    role="button"
    tabindex="0"
    aria-label="Design canvas"
    onclick={click}
    onkeydown={key}
    class="relative overflow-hidden rounded-md bg-card shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    style={`aspect-ratio:${aspect};width:${landscape ? "min(100%,520px)" : "auto"};height:${landscape ? "auto" : "min(100%,380px)"};transform:scale(${zoom / 100});transition:transform .2s;filter:${filterStr(adjustments)};cursor:${tool === "move" ? "default" : "crosshair"}`}
  >
    {#each layers as layer, index (layer.id)}
      {#if layer.visible}<LayerView {layer} z={layers.length - index} selected={layer.id === selected} interactive={tool === "move"} onPointerDown={down} />{/if}
    {/each}
    {#if safe}
      <div class="pointer-events-none absolute border-2 border-dashed border-white/80" style={`top:${safeSpec.top}%;bottom:${safeSpec.bottom}%;left:${safeSpec.left}%;right:${safeSpec.right}%`} title={safeSpec.note}></div>
    {/if}
    {#if layers.length === 0}<div class="absolute inset-0 grid place-items-center text-xs text-muted-foreground">Empty canvas — pick a tool</div>{/if}
  </div>
</div>
