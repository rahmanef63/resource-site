<script lang="ts">
  import { GRID, SIZE_CELLS } from "../../glass-desktop/config/constants";
  import { resolveWidgetSize } from "../../glass-desktop/lib/layout-core";
  import { widgetCatalog } from "../../glass-desktop/lib/widget-catalog";
  import { cellToPx } from "../../glass-desktop/utils/grid";
  import type { WidgetInstance, WidgetSize } from "../../glass-desktop/types";
  import WidgetCard from "./WidgetCard.svelte";
  let { space, instances, editing = false, onMove, onRemove, onResize }: { space: 0|1; instances: WidgetInstance[]; editing?: boolean; onMove: (id:string,col:number,row:number)=>void; onRemove:(id:string)=>void; onResize:(id:string,size:WidgetSize)=>void } = $props();
  let visible = $derived(instances.filter((item) => item.space === space));
  let maxBottom = $derived(visible.reduce((max, item) => Math.max(max, item.row + SIZE_CELLS[resolveWidgetSize(item)].r), 1));
  let drag = $state<{id:string;x:number;y:number;col:number;row:number;pointer:number}|null>(null);
  function start(event: PointerEvent, item: WidgetInstance) { if (!editing || (event.target as HTMLElement).closest("button")) return; const el=event.currentTarget as HTMLElement; el.setPointerCapture(event.pointerId); drag={id:item.instanceId,x:event.clientX,y:event.clientY,col:item.col,row:item.row,pointer:event.pointerId}; }
  function finish(event: PointerEvent) { if (!drag || event.pointerId !== drag.pointer) return; const stepX=GRID.cellW+GRID.gap, stepY=GRID.cellH+GRID.gap; onMove(drag.id, drag.col+Math.round((event.clientX-drag.x)/stepX), drag.row+Math.round((event.clientY-drag.y)/stepY)); drag=null; }
  function keyMove(event: KeyboardEvent, item: WidgetInstance) { if (!editing) return; const delta: Record<string,[number,number]> = { ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1] }; const d=delta[event.key]; if (!d) return; event.preventDefault(); onMove(item.instanceId,item.col+d[0],item.row+d[1]); }
</script>
<div class="scroll"><div class="canvas" style:width={`${GRID.cols*GRID.cellW+(GRID.cols-1)*GRID.gap}px`} style:min-height={`${Math.max(maxBottom*(GRID.cellH+GRID.gap)-GRID.gap,GRID.cellH)}px`}>
{#each visible as item (item.instanceId)}
  {@const descriptor = widgetCatalog[item.widgetId]}
  {@const size = resolveWidgetSize(item)}
  {@const cells = SIZE_CELLS[size]}
  {@const rect = cellToPx(item.col,item.row,cells.c,cells.r)}
  {#if descriptor}<div class:editing class="item" role="button" tabindex={editing ? 0 : -1} aria-label={`Move ${descriptor.title}`} data-instance={item.instanceId} style:left={`${rect.left}px`} style:top={`${rect.top}px`} style:width={`${rect.width}px`} style:height={`${rect.height}px`} onpointerdown={(e)=>start(e,item)} onpointerup={finish} onpointercancel={() => (drag=null)} onkeydown={(e)=>keyMove(e,item)}><WidgetCard instance={item} {descriptor} pill={cells.r===1} {editing} {onRemove} {onResize}/></div>{/if}
{/each}
</div></div>
<style>
  .scroll{height:100%;overflow:auto;padding:1rem 3rem 4rem}.canvas{position:relative;margin:0 auto}.item{position:absolute;transition:left var(--duration-settle) var(--ease-settle),top var(--duration-settle) var(--ease-settle);touch-action:none}.item.editing{cursor:grab}.item.editing:active{cursor:grabbing;z-index:20;filter:brightness(1.06)}@media(max-width:760px){.scroll{padding-inline:1rem}}
</style>
