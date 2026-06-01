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
import { blankDoc } from "./model";
import { useLayerMutators } from "./layer-mutators";
import { useDocOps } from "./doc-ops";
import { useHistory } from "./history";
import { useProjectIO, type Project } from "./project";
import { useMaskOps } from "./mask";

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
  /** History revision — bumps on every change; masked-group caches off it. */
  version: number;
  /** Id of the layer whose MASK the brush currently paints (null = none). */
  maskEditId: string | null;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  canvasFor: (id: string, w: number, h: number) => HTMLCanvasElement;
  select: (id: string | null) => void;
  setTool: (t: Tool) => void;
  setZoom: (z: number) => void;
  setPan: (p: Pan) => void;
  setMaskEdit: (id: string | null) => void;
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
  /** Crop the document to (x,y,w,h): resize + shift layers + re-bake paint pixels. */
  applyCrop: (x: number, y: number, w: number, h: number) => void;
  /** Add / remove a layer mask (doc-aligned alpha buffer). */
  addMask: (id: string) => void;
  removeMask: (id: string) => void;
  /** Record a brush/eraser stroke (before+after PNG of the layer canvas). */
  recordPaint: (id: string, before: string, after: string) => void;
  /** Editable-project (doc + paint pixels) save/restore — Save/Open/autosave. */
  exportProject: () => Project;
  loadProject: (p: Project) => void;
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
  const [maskEditId, setMaskEditId] = useState<string | null>(null);
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
  const { addLayer, removeLayer, duplicateLayer, reorder, raise, lower, setDocSize, applyCrop } = useDocOps(setDoc, canvases, setSelectedId);
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

  const { exportProject, loadProject } = useProjectIO({ doc, canvases, canvasFor, setDoc: setDocState, setSelected: setSelectedId, stageRef });
  const { addMask, removeMask } = useMaskOps({ canvasFor, canvases, update, docSize: () => ({ w: doc.width, h: doc.height }), setMaskEdit: setMaskEditId });

  const value = useMemo<Ctx>(() => ({
    doc, selectedId, selected: doc.layers.find((l) => l.id === selectedId) ?? null,
    tool, zoom, pan, brush, canUndo, canRedo, version: rev, maskEditId, stageRef, canvasFor,
    select: setSelectedId, setTool, setZoom, setPan, setMaskEdit: setMaskEditId,
    setBrush: (b) => setBrushState((s) => ({ ...s, ...b })),
    setDocSize, update, patchStyle, patchShadow, patchGlow, patchStroke, patchAdj,
    addLayer, removeLayer, duplicateLayer, reorder, raise, lower, applyCrop, addMask, removeMask,
    recordPaint, exportProject, loadProject, undo, redo,
  }), [doc, selectedId, tool, zoom, pan, brush, canUndo, canRedo, rev, maskEditId, canvasFor, setDocSize, update, patchStyle, patchShadow, patchGlow, patchStroke, patchAdj, addLayer, removeLayer, duplicateLayer, reorder, raise, lower, applyCrop, addMask, removeMask, recordPaint, exportProject, loadProject, undo, redo]);

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): Ctx {
  const c = useContext(EditorContext);
  if (!c) throw new Error("useEditor must be used within <EditorProvider>");
  return c;
}
