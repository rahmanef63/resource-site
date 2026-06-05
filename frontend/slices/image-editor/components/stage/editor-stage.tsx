"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer as KLayer, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEditor } from "../../lib/store";
import { useStageView } from "../../hooks/use-stage-view";
import { LayerNode } from "./layer-node";
import { TextOverlay } from "./text-overlay";
import { ZoomHud } from "./zoom-hud";
import { CropOverlay } from "./crop-overlay";
import { SelectionOverlay } from "./selection-overlay";
import { MaskSurface } from "./mask-surface";
import { FilteredGroup } from "./filtered-group";

type AnyNode = Konva.Node | null;

// The canvas surface: a measured Stage with the document positioned by `pan` and
// scaled by `zoom`. Wheel/pinch zoom, hand/space drag-pan, fit-to-screen (HUD).
// A Transformer attaches to the selection when the Move tool is active.
export function EditorStage() {
  const { doc, zoom, pan, tool, selectedId, select, setPan, setTool, setFg, update, applyCrop, maskEditId, version, stageRef } = useEditor();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [editId, setEditId] = useState<string | null>(null);
  const nodes = useRef<Map<string, AnyNode>>(new Map());
  const trRef = useRef<Konva.Transformer | null>(null);
  const { panMode, fit, center100, clampPan, onWheel, onTouchMove, onTouchEnd, zoomTo } = useStageView(size);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // Round + bail-if-unchanged: sub-pixel contentRect jitter inside a flex/window
    // container would otherwise feed back (setSize → re-render → layout → observe →
    // setSize …) and trip React's "Maximum update depth" guard. Same object ref on
    // no-op so React skips the render entirely.
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      const h = Math.round(e.contentRect.height);
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const sel = selectedId ? nodes.current.get(selectedId) : null;
    const locked = doc.layers.find((l) => l.id === selectedId)?.locked;
    tr.nodes(tool === "move" && sel && !locked ? [sel] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, tool, doc.layers]);

  const hex = (n: number) => n.toString(16).padStart(2, "0");
  const onBgDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (panMode) return;
    if (tool === "eyedropper") {
      const stage = e.target.getStage();
      const p = stage?.getPointerPosition();
      if (!stage || !p) return;
      // pixelRatio:1 → output px match CSS pointer coords.
      const ctx = stage.toCanvas({ pixelRatio: 1 }).getContext("2d");
      const d = ctx?.getImageData(Math.round(p.x), Math.round(p.y), 1, 1).data;
      if (d && d[3] > 0) setFg(`#${hex(d[0])}${hex(d[1])}${hex(d[2])}`);
      return;
    }
    if (e.target === e.target.getStage() || e.target.name() === "doc-bg") select(null);
  };
  const zoomStep = (d: number) => zoomTo(zoom * (d > 0 ? 1.2 : 0.83), size.w / 2, size.h / 2);
  const onDbl = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const l = doc.layers.find((x) => x.id === e.target.name());
    if (l?.kind === "text" && !l.locked) { select(l.id); setEditId(l.id); }
  };
  const editing = editId ? doc.layers.find((l) => l.id === editId) ?? null : null;

  // Transparency checker pattern, painted only INSIDE the document (the
  // surrounding area is a flat gray pasteboard, Photoshop-style).
  const checker = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const x = c.getContext("2d");
    if (x) {
      x.fillStyle = "#ffffff";
      x.fillRect(0, 0, 16, 16);
      x.fillStyle = "#cbd1d9";
      x.fillRect(0, 0, 8, 8);
      x.fillRect(8, 8, 8, 8);
    }
    return c;
  }, []);

  // Render loop (accumulator): an adjustment layer wraps everything below it in
  // a filtered cached group; other layers stack on top. See ARCHITECTURE.md.
  const registerNode = (id: string, n: Konva.Node | null) => {
    if (n) nodes.current.set(id, n);
    else nodes.current.delete(id);
  };
  let acc: React.ReactNode[] = [];
  for (const l of doc.layers) {
    if (l.kind === "adjustment") {
      if (!l.visible) continue; // hidden adjustment = pass-through
      const below = acc;
      acc = [
        <FilteredGroup key={`adj-${l.id}`} adj={l.adj} width={doc.width} height={doc.height} version={version}>
          {below}
        </FilteredGroup>,
      ];
    } else {
      acc.push(<LayerNode key={l.id} layer={l} isSelected={l.id === selectedId} registerNode={registerNode} />);
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800"
      style={{ cursor: panMode ? "grab" : "default" }}
    >
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        onMouseDown={onBgDown}
        onTouchStart={onBgDown}
        onWheel={onWheel}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDblClick={onDbl}
        onDblTap={onDbl}
      >
        <KLayer
          x={pan.x}
          y={pan.y}
          scaleX={zoom}
          scaleY={zoom}
          draggable={panMode}
          onDragEnd={(e) => setPan(clampPan({ x: e.target.x(), y: e.target.y() }, zoom))}
        >
          <Rect
            name="doc-bg"
            x={0}
            y={0}
            width={doc.width}
            height={doc.height}
            {...(doc.bg === "transparent"
              ? { fillPatternImage: checker as unknown as HTMLImageElement, fillPatternRepeat: "repeat" }
              : { fill: doc.bg })}
            shadowColor="#000000"
            shadowOpacity={0.25}
            shadowBlur={16}
            shadowOffsetY={3}
          />
          {acc}
          {maskEditId && <MaskSurface layerId={maskEditId} />}
        </KLayer>
        <KLayer>
          <Transformer
            ref={trRef}
            rotateEnabled
            keepRatio={false}
            anchorSize={9}
            borderStroke="#3b82f6"
            anchorStroke="#3b82f6"
            anchorCornerRadius={2}
            boundBoxFunc={(o, n) => (n.width < 8 || n.height < 8 ? o : n)}
          />
        </KLayer>
      </Stage>

      <ZoomHud zoom={zoom} onOut={() => zoomStep(-1)} onIn={() => zoomStep(1)} onReset={center100} onFit={fit} />

      {tool === "crop" && (
        <CropOverlay
          doc={doc}
          zoom={zoom}
          pan={pan}
          onApply={(x, y, w, h) => { applyCrop(x, y, w, h); setTool("move"); }}
          onCancel={() => setTool("move")}
        />
      )}

      {tool === "select" && <SelectionOverlay onDone={() => setTool("move")} />}

      {editing && (
        <TextOverlay
          layer={editing}
          zoom={zoom}
          pan={pan}
          onChange={(text) => update(editing.id, { text })}
          onDone={() => setEditId(null)}
        />
      )}
    </div>
  );
}
