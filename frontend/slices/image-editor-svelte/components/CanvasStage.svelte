<script lang="ts">
  import { onMount, untrack } from "svelte";
  import Konva from "konva";
  import type { BrowserEditorCore, EditorSnapshot } from "@/features/image-editor/lib/editor-core";
  import { rebuildKonvaDocument } from "@/features/image-editor/lib/konva-native";
  import { maskKey } from "@/features/image-editor/lib/mask-core";

  let { editor } = $props<{ editor: BrowserEditorCore }>();
  let host: HTMLDivElement | undefined;
  let snapshot = $state<EditorSnapshot>(untrack(() => editor.getSnapshot()));
  let stage: Konva.Stage | null = null;
  let docLayer: Konva.Layer | null = null;
  let docGroup: Konva.Group | null = null;
  let transformLayer: Konva.Layer | null = null;
  let transformer: Konva.Transformer | null = null;
  let renderSeq = 0;
  let drawing = false;
  let strokeBefore = "";
  let last: { x: number; y: number } | null = null;

  const clampZoom = (value: number) => Math.max(.08, Math.min(6, value));
  function attachHost(node: HTMLDivElement) {
    host = node;
    return () => { if (host === node) host = undefined; };
  }
  function resize() {
    if (!stage || !host) return;
    stage.size({ width: Math.max(1, host.clientWidth), height: Math.max(1, host.clientHeight) });
    stage.draw();
  }
  function fit() {
    if (!stage || !docGroup) return;
    const z = clampZoom(Math.min((stage.width() - 48) / snapshot.doc.width, (stage.height() - 48) / snapshot.doc.height));
    const pan = { x: (stage.width() - snapshot.doc.width * z) / 2, y: (stage.height() - snapshot.doc.height * z) / 2 };
    editor.setZoom(z); editor.setPan(pan);
  }
  function targetCanvas() {
    const selected = snapshot.doc.layers.find((layer) => layer.id === snapshot.selectedId);
    if (snapshot.maskEditId) return { id: maskKey(snapshot.maskEditId), canvas: editor.canvasFor(maskKey(snapshot.maskEditId), snapshot.doc.width, snapshot.doc.height) };
    if (selected?.kind === "paint") return { id: selected.id, canvas: editor.canvasFor(selected.id, snapshot.doc.width, snapshot.doc.height) };
    return null;
  }
  function drawTo(x: number, y: number) {
    const target = targetCanvas(); if (!target) return;
    const ctx = target.canvas.getContext("2d"); if (!ctx) return;
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = snapshot.brush.size; ctx.globalAlpha = snapshot.brush.opacity;
    if (snapshot.tool === "eraser" || snapshot.maskEditId) ctx.globalCompositeOperation = snapshot.maskEditId && snapshot.tool === "brush" ? "source-over" : "destination-out";
    else { ctx.strokeStyle = snapshot.brush.color; ctx.shadowColor = snapshot.brush.color; ctx.shadowBlur = (1 - snapshot.brush.hardness) * snapshot.brush.size * .6; }
    const prev = last ?? { x, y }; ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(x, y); ctx.stroke(); ctx.restore(); last = { x, y }; docLayer?.batchDraw();
  }
  function pointer() { return docGroup?.getRelativePointerPosition() ?? null; }
  function down(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    if (snapshot.tool === "eyedropper") {
      const p = stage?.getPointerPosition(); if (stage && p) { const c=stage.toCanvas({x:p.x,y:p.y,width:1,height:1,pixelRatio:1}); const data=c.getContext("2d")?.getImageData(0,0,1,1).data; if(data) editor.setFg(`#${[data[0],data[1],data[2]].map(v=>v.toString(16).padStart(2,"0")).join("")}`); }
      return;
    }
    if (snapshot.tool !== "brush" && snapshot.tool !== "eraser") { if (event.target === stage) editor.select(null); return; }
    const target = targetCanvas(), p = pointer(); if (!target || !p) return;
    strokeBefore = target.canvas.toDataURL(); drawing = true; last = null; drawTo(p.x, p.y);
  }
  function move() { if (!drawing) return; const p=pointer(); if(p) drawTo(p.x,p.y); }
  function end() { if (!drawing) return; const target=targetCanvas(); drawing=false; last=null; if(target && strokeBefore) editor.recordPaint(target.id, strokeBefore, target.canvas.toDataURL()); strokeBefore=""; }
  function wheel(event: Konva.KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault(); if (!stage) return;
    const point=stage.getPointerPosition(); if(!point)return;
    const old=snapshot.zoom, next=clampZoom(old*(event.evt.deltaY>0?.9:1.1));
    const mouse={x:(point.x-snapshot.pan.x)/old,y:(point.y-snapshot.pan.y)/old};
    editor.setZoom(next); editor.setPan({x:point.x-mouse.x*next,y:point.y-mouse.y*next});
  }

  async function renderScene() {
    if (!docGroup || !transformer) return;
    const seq=++renderSeq; docGroup.position(snapshot.pan); docGroup.scale({x:snapshot.zoom,y:snapshot.zoom}); docGroup.draggable(snapshot.tool === "hand");
    const result=await rebuildKonvaDocument({docGroup,editor,snapshot,isCurrent:()=>seq===renderSeq});
    if(seq!==renderSeq)return;
    transformer.nodes(snapshot.tool === "move" && result.selectedNode ? [result.selectedNode] : []); transformLayer?.batchDraw();
  }
  onMount(() => {
    if (!host) return;
    stage=new Konva.Stage({container:host,width:host.clientWidth,height:host.clientHeight}); editor.stageRef.current=stage;
    docLayer=new Konva.Layer(); docGroup=new Konva.Group(); docLayer.add(docGroup); stage.add(docLayer);
    transformLayer=new Konva.Layer(); transformer=new Konva.Transformer({rotateEnabled:true,keepRatio:false,anchorSize:8,borderStroke:"#3b82f6",anchorStroke:"#3b82f6"}); transformLayer.add(transformer); stage.add(transformLayer);
    stage.on("mousedown touchstart",down); stage.on("mousemove touchmove",move); stage.on("mouseup touchend mouseleave",end); stage.on("wheel",wheel);
    docGroup.on("dragend",()=>editor.setPan({x:docGroup!.x(),y:docGroup!.y()}));
    const sync=()=>{snapshot=editor.getSnapshot();void renderScene();};
    const unsubscribe=editor.subscribe(sync); sync();
    const observer=new ResizeObserver(()=>resize()); observer.observe(host); resize(); fit();
    return()=>{observer.disconnect();unsubscribe();editor.stageRef.current=null;stage?.destroy();stage=null;};
  });
</script>
<div class="relative h-full min-h-72 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
  <div {@attach attachHost} class="absolute inset-0"></div>
  <div class="absolute bottom-2 right-2 flex items-center gap-1 rounded border bg-background/90 p-1 text-[10px] shadow">
    <button class="rounded px-2 py-1 hover:bg-muted" onclick={()=>editor.setZoom(clampZoom(snapshot.zoom*.83))}>−</button>
    <button class="rounded px-2 py-1 tabular-nums hover:bg-muted" onclick={fit}>{Math.round(snapshot.zoom*100)}%</button>
    <button class="rounded px-2 py-1 hover:bg-muted" onclick={()=>editor.setZoom(clampZoom(snapshot.zoom*1.2))}>+</button>
  </div>
  {#if snapshot.maskEditId}<div class="absolute left-2 top-2 rounded bg-amber-500/90 px-2 py-1 text-[10px] font-medium text-black">Editing mask · brush reveals · eraser hides</div>{/if}
</div>
