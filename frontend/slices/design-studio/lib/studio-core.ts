import { ADJ_DEFAULT, FILTERS, type AdjustKey, type Adjustments } from "./filters";
import { createLayer, freshInitialLayers, type Layer, type LayerKind, type ToolId } from "./model-core";

const HISTORY = 50;
const DEBOUNCE_MS = 400;
type Listener = () => void;
export type StudioSnapshot = {
  layers: Layer[]; selected: string | null; adjustments: Adjustments; activeFilter: string;
  canUndo: boolean; canRedo: boolean;
};
export type LayerUpdater = Layer[] | ((layers: Layer[]) => Layer[]);

export function createStudioStore() {
  let layers = freshInitialLayers();
  let selected: string | null = layers[0]?.id ?? null;
  let adjustments: Adjustments = { ...ADJ_DEFAULT };
  let activeFilter = "Original";
  let past: Layer[][] = [];
  let future: Layer[][] = [];
  let lastPush = 0;
  let snapshot: StudioSnapshot;
  const listeners = new Set<Listener>();

  const refresh = () => {
    snapshot = { layers, selected, adjustments, activeFilter, canUndo: past.length > 0, canRedo: future.length > 0 };
    listeners.forEach((listener) => listener());
  };
  const setLayers = (next: LayerUpdater, force = false) => {
    const prev = layers;
    const now = Date.now();
    if (force || now - lastPush > DEBOUNCE_MS) {
      past = [...past.slice(-(HISTORY - 1)), prev];
      future = [];
    }
    lastPush = now;
    layers = typeof next === "function" ? next(prev) : next;
    refresh();
  };
  const setSelected = (id: string | null) => { selected = id; refresh(); };
  const setAdjustments = (next: Adjustments | ((value: Adjustments) => Adjustments)) => {
    adjustments = typeof next === "function" ? next(adjustments) : next; refresh();
  };
  const setActiveFilter = (name: string) => { activeFilter = name; refresh(); };
  const commit = () => { lastPush = 0; };
  const undo = () => {
    if (!past.length) return;
    future = [layers, ...future].slice(0, HISTORY);
    layers = past[past.length - 1]; past = past.slice(0, -1); lastPush = Date.now(); refresh();
  };
  const redo = () => {
    if (!future.length) return;
    past = [...past, layers].slice(-HISTORY); layers = future[0]; future = future.slice(1); lastPush = Date.now(); refresh();
  };
  const update = (id: string, patch: Partial<Layer>) => setLayers((all) => all.map((layer) => layer.id === id ? { ...layer, ...patch } : layer));
  const toggle = (id: string) => setLayers((all) => all.map((layer) => layer.id === id ? { ...layer, visible: !layer.visible } : layer));
  const reorder = (id: string, dir: -1 | 1) => setLayers((all) => {
    const i = all.findIndex((layer) => layer.id === id); const j = i + dir;
    if (j < 0 || j >= all.length) return all;
    const next = [...all]; [next[i], next[j]] = [next[j], next[i]]; return next;
  }, true);
  const remove = (id: string) => {
    setLayers((all) => all.filter((layer) => layer.id !== id), true);
    if (selected === id) selected = null;
    refresh();
  };
  const add = (kind: LayerKind, extra: Partial<Layer> = {}) => {
    const layer = createLayer(kind, extra); setLayers((all) => [layer, ...all], true); selected = layer.id; refresh(); return layer;
  };
  const loadLayers = (next: Layer[]) => { setLayers(next, true); selected = next[0]?.id ?? null; refresh(); };
  const place = (tool: ToolId, x: number, y: number) => {
    if (tool === "text") add("text", { x, y });
    else if (tool === "rect") add("shape", { x, y, shape: "rect", name: "Rectangle" });
    else if (tool === "ellipse") add("shape", { x, y, shape: "ellipse", name: "Ellipse" });
    else if (tool === "sticker") add("sticker", { x, y });
  };
  const adjust = (key: AdjustKey, value: number) => { adjustments = { ...adjustments, [key]: value }; activeFilter = "—"; refresh(); };
  const applyFilter = (name: string) => {
    const preset = FILTERS.find((item) => item.name === name) ?? FILTERS[0];
    adjustments = { ...ADJ_DEFAULT, ...preset.a }; activeFilter = preset.name; refresh();
  };
  const resetAdjust = () => { adjustments = { ...ADJ_DEFAULT }; activeFilter = "Original"; refresh(); };

  refresh();
  return {
    subscribe(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => snapshot,
    setLayers, setSelected, setAdjustments, setActiveFilter, commit, undo, redo,
    update, toggle, reorder, remove, add, loadLayers, place, adjust, applyFilter, resetAdjust,
  };
}
export type StudioStore = ReturnType<typeof createStudioStore>;
