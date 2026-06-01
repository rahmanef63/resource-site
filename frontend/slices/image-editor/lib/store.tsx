"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type Konva from "konva";
import type {
  Adjustments,
  Doc,
  DropShadow,
  Layer,
  LayerStyle,
  OuterGlow,
  Pan,
  Stroke,
  Tool,
} from "./types";
import { blankDoc, createLayer } from "./model";
import { useLayerMutators } from "./layer-mutators";
import { useHistory } from "./history";

export type Brush = { size: number; color: string; opacity: number; hardness: number };
export type { Pan };

type Ctx = {
  doc: Doc;
  selectedId: string | null;
  selected: Layer | null;
  tool: Tool;
  zoom: number;
  pan: Pan;
  brush: Brush;
  canUndo: boolean;
  canRedo: boolean;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  canvasFor: (id: string, w: number, h: number) => HTMLCanvasElement;
  select: (id: string | null) => void;
  setTool: (t: Tool) => void;
  setZoom: (z: number) => void;
  setPan: (p: Pan) => void;
  setBrush: (b: Partial<Brush>) => void;
  setDocSize: (w: number, h: number) => void;
  update: (id: string, patch: Partial<Layer>) => void;
  patchStyle: (id: string, patch: Partial<LayerStyle>) => void;
  patchShadow: (id: string, patch: Partial<DropShadow>) => void;
  patchGlow: (id: string, patch: Partial<OuterGlow>) => void;
  patchStroke: (id: string, patch: Partial<Stroke>) => void;
  patchAdj: (id: string, patch: Partial<Adjustments>) => void;
  addLayer: (layer: Layer, opts?: { select?: boolean }) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  reorder: (from: number, to: number) => void;
  raise: (id: string) => void;
  lower: (id: string) => void;
  /** Record a brush/eraser stroke (before+after PNG of the layer canvas). */
  recordPaint: (id: string, before: string, after: string) => void;
  undo: () => void;
  redo: () => void;
};

const EditorContext = createContext<Ctx | null>(null);

export function EditorProvider({ initialDoc, children }: { initialDoc?: Doc; children: ReactNode }) {
  const [doc, setDocState] = useState<Doc>(() => initialDoc ?? blankDoc());
  const [selectedId, setSelectedId] = useState<string | null>(doc.layers.at(-1)?.id ?? null);
  const [tool, setTool] = useState<Tool>("move");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [brush, setBrushState] = useState<Brush>({ size: 28, color: "#111827", opacity: 1, hardness: 0.8 });
  const canvases = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const stageRef = useRef<Konva.Stage | null>(null);

  // Restore a paint layer's pixels from a PNG snapshot (undo/redo of strokes).
  const applyPaint = useCallback((id: string, dataUrl: string) => {
    const c = canvases.current.get(id);
    if (!c) return;
    const img = new window.Image();
    img.onload = () => {
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      stageRef.current?.draw();
    };
    img.src = dataUrl;
  }, []);

  const history = useHistory({ doc: setDocState, paint: applyPaint });
  const { push, undo, redo, rev, canUndo, canRedo } = history;

  // Apply a doc change, pushing a {before,after} step unless transient (track:false).
  const setDoc = useCallback((next: Doc | ((d: Doc) => Doc), track = true) => {
    setDocState((prev) => {
      const n = typeof next === "function" ? next(prev) : next;
      if (track) push({ type: "doc", before: prev, after: n });
      return n;
    });
  }, [push]);

  const mapLayer = useCallback(
    (id: string, fn: (l: Layer) => Layer, track = true) =>
      setDoc((d) => ({ ...d, layers: d.layers.map((l) => (l.id === id ? fn(l) : l)) }), track),
    [setDoc],
  );
  const { update, patchStyle, patchShadow, patchGlow, patchStroke, patchAdj } = useLayerMutators(mapLayer);

  const addLayer = useCallback((layer: Layer, opts?: { select?: boolean }) => {
    setDoc((d) => ({ ...d, layers: [...d.layers, layer] }));
    if (opts?.select !== false) setSelectedId(layer.id);
  }, [setDoc]);

  const removeLayer = useCallback((id: string) => {
    canvases.current.delete(id);
    setDoc((d) => ({ ...d, layers: d.layers.filter((l) => l.id !== id) }));
    setSelectedId((s) => (s === id ? null : s));
  }, [setDoc]);

  const duplicateLayer = useCallback((id: string) => {
    setDoc((d) => {
      const i = d.layers.findIndex((l) => l.id === id);
      if (i < 0) return d;
      const src = d.layers[i];
      const copy = createLayer(src.kind, { ...src, name: `${src.name} copy`, t: { ...src.t, x: src.t.x + 24, y: src.t.y + 24 } });
      return { ...d, layers: [...d.layers.slice(0, i + 1), copy, ...d.layers.slice(i + 1)] };
    });
  }, [setDoc]);

  const reorder = useCallback((from: number, to: number) => {
    setDoc((d) => {
      const ls = [...d.layers];
      const [m] = ls.splice(from, 1);
      ls.splice(to, 0, m);
      return { ...d, layers: ls };
    });
  }, [setDoc]);

  const move = useCallback((id: string, dir: 1 | -1) => {
    setDoc((d) => {
      const i = d.layers.findIndex((l) => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.layers.length) return d;
      const ls = [...d.layers];
      [ls[i], ls[j]] = [ls[j], ls[i]];
      return { ...d, layers: ls };
    });
  }, [setDoc]);

  const setDocSize = useCallback((w: number, h: number) => setDoc((d) => ({ ...d, width: w, height: h })), [setDoc]);
  const recordPaint = useCallback((id: string, before: string, after: string) => push({ type: "paint", id, before, after }), [push]);

  const canvasFor = useCallback((id: string, w: number, h: number) => {
    let c = canvases.current.get(id);
    if (!c) {
      c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      canvases.current.set(id, c);
    }
    return c;
  }, []);

  const value = useMemo<Ctx>(() => ({
    doc, selectedId, selected: doc.layers.find((l) => l.id === selectedId) ?? null,
    tool, zoom, pan, brush, canUndo, canRedo, stageRef, canvasFor,
    select: setSelectedId, setTool, setZoom, setPan,
    setBrush: (b) => setBrushState((s) => ({ ...s, ...b })),
    setDocSize, update, patchStyle, patchShadow, patchGlow, patchStroke, patchAdj,
    addLayer, removeLayer, duplicateLayer, reorder,
    raise: (id) => move(id, 1), lower: (id) => move(id, -1),
    recordPaint, undo, redo,
  }), [doc, selectedId, tool, zoom, pan, brush, canUndo, canRedo, rev, canvasFor, setDoc, setDocSize, update, patchStyle, patchShadow, patchGlow, patchStroke, patchAdj, addLayer, removeLayer, duplicateLayer, reorder, move, recordPaint, undo, redo]);

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): Ctx {
  const c = useContext(EditorContext);
  if (!c) throw new Error("useEditor must be used within <EditorProvider>");
  return c;
}
