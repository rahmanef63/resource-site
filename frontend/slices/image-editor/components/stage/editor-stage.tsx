"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer as KLayer, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEditor } from "../../lib/store";
import { LayerNode } from "./layer-node";

type AnyNode = Konva.Node | null;

// The canvas surface: a measured Stage with the document centered + zoom-scaled.
// A Transformer attaches to the selected node when the Move tool is active. The
// wrapper paints a checker so layer transparency reads through the Konva canvas.
export function EditorStage() {
  const { doc, zoom, tool, selectedId, select, stageRef } = useEditor();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const nodes = useRef<Map<string, AnyNode>>(new Map());
  const trRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setSize({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Attach/detach the transformer to the current selection.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const sel = selectedId ? nodes.current.get(selectedId) : null;
    const locked = doc.layers.find((l) => l.id === selectedId)?.locked;
    tr.nodes(tool === "move" && sel && !locked ? [sel] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, tool, doc.layers]);

  const gx = Math.round((size.w - doc.width * zoom) / 2);
  const gy = Math.round((size.h - doc.height * zoom) / 2);

  const onBgMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Clicking empty stage / the document background clears the selection.
    if (e.target === e.target.getStage() || e.target.name() === "doc-bg") select(null);
  };

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
      style={{
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
        onMouseDown={onBgMouseDown}
        onTouchStart={onBgMouseDown}
        draggable={tool === "hand"}
      >
        <KLayer x={gx} y={gy} scaleX={zoom} scaleY={zoom}>
          {doc.bg !== "transparent" && (
            <Rect name="doc-bg" x={0} y={0} width={doc.width} height={doc.height} fill={doc.bg} />
          )}
          {doc.layers.map((l) => (
            <LayerNode
              key={l.id}
              layer={l}
              isSelected={l.id === selectedId}
              registerNode={(id, n) => {
                if (n) nodes.current.set(id, n);
                else nodes.current.delete(id);
              }}
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
            boundBoxFunc={(oldB, newB) => (newB.width < 8 || newB.height < 8 ? oldB : newB)}
          />
        </KLayer>
      </Stage>
    </div>
  );
}
