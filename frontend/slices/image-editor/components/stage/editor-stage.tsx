"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer as KLayer, Rect, Transformer } from "react-konva";
import { Minus, Plus, Maximize } from "lucide-react";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEditor } from "../../lib/store";
import { useStageView } from "../../hooks/use-stage-view";
import { LayerNode } from "./layer-node";
import { TextOverlay } from "./text-overlay";

type AnyNode = Konva.Node | null;

// The canvas surface: a measured Stage with the document positioned by `pan` and
// scaled by `zoom`. Wheel/pinch zoom, hand/space drag-pan, fit-to-screen (HUD).
// A Transformer attaches to the selection when the Move tool is active.
export function EditorStage() {
  const { doc, zoom, pan, tool, selectedId, select, setPan, setZoom, setBrush, update, stageRef } = useEditor();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [editId, setEditId] = useState<string | null>(null);
  const nodes = useRef<Map<string, AnyNode>>(new Map());
  const trRef = useRef<Konva.Transformer | null>(null);
  const { panMode, fit, onWheel, onTouchMove, onTouchEnd, zoomTo } = useStageView(size);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
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
      if (d && d[3] > 0) setBrush({ color: `#${hex(d[0])}${hex(d[1])}${hex(d[2])}` });
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

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
      style={{
        cursor: panMode ? "grab" : "default",
        backgroundColor: "#e9eaee",
        backgroundImage:
          "linear-gradient(45deg,#cfd2da 25%,transparent 25%),linear-gradient(-45deg,#cfd2da 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#cfd2da 75%),linear-gradient(-45deg,transparent 75%,#cfd2da 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
      }}
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
          onDragEnd={(e) => setPan({ x: e.target.x(), y: e.target.y() })}
        >
          {doc.bg !== "transparent" && (
            <Rect name="doc-bg" x={0} y={0} width={doc.width} height={doc.height} fill={doc.bg} />
          )}
          {doc.layers.map((l) => (
            <LayerNode
              key={l.id}
              layer={l}
              isSelected={l.id === selectedId}
              registerNode={(id, n) => { if (n) nodes.current.set(id, n); else nodes.current.delete(id); }}
            />
          ))}
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

      {/* Zoom HUD */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg border border-border bg-card/90 px-1 py-0.5 shadow-sm backdrop-blur">
        <button type="button" aria-label="Zoom out" onClick={() => zoomStep(-1)} className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
          <Minus className="size-4" />
        </button>
        <button type="button" onClick={() => setZoom(1)} className="w-12 text-center text-xs tabular-nums text-muted-foreground hover:text-foreground">
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => zoomStep(1)} className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
          <Plus className="size-4" />
        </button>
        <button type="button" aria-label="Fit to screen" onClick={fit} className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
          <Maximize className="size-4" />
        </button>
      </div>

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
