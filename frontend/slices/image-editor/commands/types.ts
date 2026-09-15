import type Konva from "konva";
import type {
  Adjustments,
  Doc,
  DropShadow,
  Layer,
  LayerStyle,
  OuterGlow,
  Stroke,
  Tool as EditorTool,
} from "../lib/types";

export type JsonSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

export type AnthropicTool = {
  name: string;
  description: string;
  input_schema: JsonSchema;
};

export type EditorCtx = {
  doc: Doc;
  selectedId: string | null;
  selected?: Layer | null;
  tool: EditorTool;
  brush: { size: number; color: string; opacity: number; hardness: number };
  fg: string;
  bg: string;
  canUndo: boolean;
  canRedo: boolean;
  stageRef: { current: Konva.Stage | null };
  select: (id: string | null) => void;
  setTool: (tool: EditorTool) => void;
  setBrush: (patch: Partial<EditorCtx["brush"]>) => void;
  setFg: (color: string) => void;
  setBg: (color: string) => void;
  swapColors: () => void;
  resetColors: () => void;
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
  applyCrop: (x: number, y: number, w: number, h: number) => void;
  addMask: (id: string) => void;
  removeMask: (id: string) => void;
  undo: () => void;
  redo: () => void;
};

export type EditorCommand = {
  name: string;
  description: string;
  parameters: JsonSchema;
  dangerous?: boolean;
  run: (ctx: EditorCtx, args: Record<string, unknown>) => string | Promise<string>;
};

export type EditorToolCollection = {
  namespace: "image-editor";
  tools: EditorCommand[];
  describe: (ctx: EditorCtx) => string;
  instructions: string;
};
