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
  Stroke,
  Tool,
} from "./types";
import { blankDoc, createLayer } from "./model";
import { useLayerMutators } from "./layer-mutators";

export type Brush = { size: number; color: string; opacity: number; hardness: number };

type Ctx = {
  doc: Doc;
  selectedId: string | null;
  selected: Layer | null;
  tool: Tool;
  zoom: number;
  brush: Brush;
  canUndo: boolean;
  canRedo: boolean;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  /** Offscreen pixel buffers for paint layers, keyed by layer id. */
  canvasFor: (id: string, w: number, h: number) => HTMLCanvasElement;
  select: (id: string | null) => void;
  setTool: (t: Tool) => void;
  setZoom: (z: number) => void;
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
  undo: () => void;
  redo: () => void;
  commit: () => void;
};

const EditorContext = createContext<Ctx | null>(null);
const HISTORY = 60;

export function EditorProvider({
  initialDoc,
  children,
}: {
  initialDoc?: Doc;
  children: ReactNode;
}) {
  const [doc, setDocState] = useState<Doc>(() => initialDoc ?? blankDoc());
  const [selectedId, setSelectedId] = useState<string | null>(doc.layers.at(-1)?.id ?? null);
  const [tool, setTool] = useState<Tool>("move");
  const [zoom, setZoom] = useState(1);
  const [brush, setBrushState] = useState<Brush>({ size: 28, color: "#111827", opacity: 1, hardness: 0.8 });
  const past = useRef<Doc[]>([]);
  const future = useRef<Doc[]>([]);
  const [, force] = useState(0);
  const canvases = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const stageRef = useRef<Konva.Stage | null>(null);

  // Push history then apply. `track:false` = transient (drag tick) — no snapshot.
  const setDoc = useCallback((next: Doc | ((d: Doc) => Doc), track = true) => {
    setDocState((prev) => {
      if (track) {
        past.current = [...past.current.slice(-(HISTORY - 1)), prev];
        future.current = [];
      }
      return typeof next === "function" ? next(prev) : next;
    });
  }, []);

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

  const undo = useCallback(() => {
    if (!past.current.length) return;
    setDocState((cur) => {
      future.current = [cur, ...future.current].slice(0, HISTORY);
      const prev = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      return prev;
    });
    force((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    setDocState((cur) => {
      past.current = [...past.current, cur].slice(-HISTORY);
      const next = future.current[0];
      future.current = future.current.slice(1);
      return next;
    });
    force((n) => n + 1);
  }, []);

  const commit = useCallback(() => { past.current = [...past.current.slice(-(HISTORY - 1)), doc]; future.current = []; }, [doc]);

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
    tool, zoom, brush, canUndo: past.current.length > 0, canRedo: future.current.length > 0,
    stageRef, canvasFor,
    select: setSelectedId, setTool, setZoom,
    setBrush: (b) => setBrushState((s) => ({ ...s, ...b })),
    setDocSize, update, patchStyle, patchShadow, patchGlow, patchStroke, patchAdj,
    addLayer, removeLayer, duplicateLayer, reorder,
    raise: (id) => move(id, 1), lower: (id) => move(id, -1),
    undo, redo, commit,
  }), [doc, selectedId, tool, zoom, brush, canvasFor, setDoc, setDocSize, update, patchStyle, patchShadow, patchGlow, patchStroke, patchAdj, addLayer, removeLayer, duplicateLayer, reorder, move, undo, redo, commit]);

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): Ctx {
  const c = useContext(EditorContext);
  if (!c) throw new Error("useEditor must be used within <EditorProvider>");
  return c;
}
