import Konva from "konva";
import type { BrowserEditorCore, EditorSnapshot } from "./editor-core";
import { blendToGCO, buildFilters, fillProps, glowProps, hasFilters, loadImage, shadowProps, strokeProps } from "./konva-helpers";
import { maskKey } from "./mask-core";
import type { Layer } from "./types";

type RenderResult = { selectedNode: Konva.Node | null; nodes: Map<string, Konva.Node> };

type Args = {
  docGroup: Konva.Group;
  editor: BrowserEditorCore;
  snapshot: EditorSnapshot;
  isCurrent?: () => boolean;
};

function transformGroup(layer: Layer, editor: BrowserEditorCore) {
  const group = new Konva.Group({
    x: layer.t.x, y: layer.t.y, rotation: layer.t.rotation,
    scaleX: layer.t.scaleX, scaleY: layer.t.scaleY, opacity: layer.opacity,
    visible: layer.visible, draggable: snapshotMove(editor, layer),
    globalCompositeOperation: (layer.style.clipBelow ? "source-atop" : blendToGCO(layer.style.blend)) as GlobalCompositeOperation,
  });
  group.on("click tap", () => editor.tool === "move" && editor.select(layer.id));
  group.on("dragend", () => editor.update(layer.id, { t: { ...layer.t, x: group.x(), y: group.y() } }));
  group.on("transformend", () => editor.update(layer.id, { t: { ...layer.t, x: group.x(), y: group.y(), rotation: group.rotation(), scaleX: group.scaleX(), scaleY: group.scaleY() } }));
  return group;
}
const snapshotMove = (editor: BrowserEditorCore, layer: Layer) => editor.tool === "move" && !layer.locked;

function applyVisual(node: Konva.Node, layer: Layer, width: number, height: number) {
  node.setAttrs({ ...shadowProps(layer.style), ...strokeProps(layer.style) });
  const { filters, props } = buildFilters(layer.adj);
  node.filters(filters); node.setAttrs({ brightness: 0, contrast: 0, hue: 0, saturation: 0, blurRadius: 0, ...props });
  if (hasFilters(layer.adj)) node.cache({ x: 0, y: 0, width, height, pixelRatio: 1 });
  else node.clearCache();
}

async function contentNode(layer: Layer, editor: BrowserEditorCore): Promise<{ group: Konva.Group; target: Konva.Node } | null> {
  const group = transformGroup(layer, editor);
  let node: Konva.Shape;
  let width = layer.t.width || 240, height = layer.t.height || 160;
  if (layer.kind === "paint") {
    const canvas = editor.canvasFor(layer.id, editor.doc.width, editor.doc.height);
    width = layer.t.width || editor.doc.width; height = layer.t.height || editor.doc.height;
    node = new Konva.Image({ image: canvas, width, height });
  } else if (layer.kind === "image") {
    if (!layer.src) return null;
    const image = await loadImage(layer.src).catch(() => null); if (!image) return null;
    width = layer.t.width || image.width; height = layer.t.height || image.height;
    node = new Konva.Image({ image, width, height });
  } else if (layer.kind === "text") {
    node = new Konva.Text({ text: layer.text ?? "", fontSize: layer.fontSize ?? 64, fontFamily: layer.fontFamily ?? "Inter, sans-serif", fontStyle: layer.fontStyle ?? "normal", align: layer.align ?? "left", fill: layer.fill ?? "#ffffff" });
    width = Math.max(1, node.width()); height = Math.max(1, node.height());
  } else if (layer.kind === "shape") {
    width = layer.t.width || 240; height = layer.t.height || 160;
    if (layer.shape === "ellipse") node = new Konva.Ellipse({ x: width / 2, y: height / 2, radiusX: width / 2, radiusY: height / 2, ...fillProps(layer, width, height) });
    else node = new Konva.Rect({ width, height, cornerRadius: 8, ...fillProps(layer, width, height) });
  } else return null;

  if (layer.style.glow.enabled) {
    const glow = node.clone({ listening: false, ...glowProps(layer.style) });
    group.add(glow);
  }
  applyVisual(node, layer, width, height); group.add(node);
  if (layer.mask) {
    const outer = new Konva.Group(); outer.add(group);
    const mask = new Konva.Image({ image: editor.canvasFor(maskKey(layer.id), editor.doc.width, editor.doc.height), width: editor.doc.width, height: editor.doc.height, listening: false, globalCompositeOperation: "destination-in" });
    outer.add(mask); outer.cache({ x: 0, y: 0, width: editor.doc.width, height: editor.doc.height });
    return { group: outer, target: group };
  }
  return { group, target: group };
}

function applyAdjustment(group: Konva.Group, layer: Layer, width: number, height: number) {
  const { filters, props } = buildFilters(layer.adj); group.filters(filters); group.setAttrs({ brightness: 0, contrast: 0, hue: 0, saturation: 0, blurRadius: 0, ...props });
  if (hasFilters(layer.adj)) group.cache({ x: 0, y: 0, width, height, pixelRatio: 1 });
}

export async function rebuildKonvaDocument({ docGroup, editor, snapshot, isCurrent = () => true }: Args): Promise<RenderResult> {
  docGroup.destroyChildren();
  const bg = new Konva.Rect({ x: 0, y: 0, width: snapshot.doc.width, height: snapshot.doc.height, fill: snapshot.doc.bg === "transparent" ? "rgba(255,255,255,0.001)" : snapshot.doc.bg, shadowColor: "#000", shadowOpacity: .3, shadowBlur: 24, shadowOffsetY: 6, listening: false });
  docGroup.add(bg);
  let visual: Konva.Node[] = [];
  const nodes = new Map<string, Konva.Node>();
  for (const layer of snapshot.doc.layers) {
    if (!isCurrent()) break;
    if (layer.kind === "adjustment") {
      if (!layer.visible || !visual.length) continue;
      const group = new Konva.Group(); for (const node of visual) node.moveTo(group); docGroup.add(group); applyAdjustment(group, layer, snapshot.doc.width, snapshot.doc.height); visual = [group]; continue;
    }
    const built = await contentNode(layer, editor); if (!built || !isCurrent()) continue;
    docGroup.add(built.group); visual.push(built.group); nodes.set(layer.id, built.target);
  }
  docGroup.getLayer()?.batchDraw();
  return { selectedNode: snapshot.selectedId ? nodes.get(snapshot.selectedId) ?? null : null, nodes };
}
