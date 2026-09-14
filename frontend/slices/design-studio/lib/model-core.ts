// Framework-neutral canvas model and document contract.
import type { Adjustments } from "./filters";

export type LayerKind = "image" | "text" | "shape" | "sticker" | "html";
export type ToolId = "move" | "text" | "rect" | "ellipse" | "sticker";
export type ToolMeta = { id: ToolId; key: string; label: string };

export const TOOL_META: ToolMeta[] = [
  { id: "move", key: "V", label: "Move" },
  { id: "text", key: "T", label: "Text" },
  { id: "rect", key: "R", label: "Rectangle" },
  { id: "ellipse", key: "O", label: "Ellipse" },
  { id: "sticker", key: "S", label: "Sticker" },
];

export type Layer = {
  id: string; name: string; kind: LayerKind; visible: boolean; opacity: number;
  x: number; y: number; scale: number; rotate: number; base?: boolean;
  text?: string; color?: string; shape?: "rect" | "ellipse"; emoji?: string;
  tint?: string; src?: string; html?: string; clip?: string; css?: string;
};

export type AspectPreset = { label: string; ratio: string; value: string };
export const ASPECTS: AspectPreset[] = [
  { label: "1:1", ratio: "1:1", value: "1 / 1" },
  { label: "4:5", ratio: "4:5", value: "4 / 5" },
  { label: "9:16", ratio: "9:16", value: "9 / 16" },
  { label: "16:9", ratio: "16:9", value: "16 / 9" },
  { label: "1.91:1", ratio: "1.91:1", value: "1.91 / 1" },
];
export const EMOJIS = ["✨","🔥","❤️","😎","👍","🎉","⭐","💯","😂","🚀","🌈","📸"];
export const LAYER_TINTS = [
  "linear-gradient(135deg,#34d39a,#3aa0ff)",
  "linear-gradient(135deg,#7a5cff,#c5318f)",
  "linear-gradient(135deg,#ffb13b,#ff6a3d)",
];
export const PREVIEW_GRADIENT = "linear-gradient(135deg,#ff9a6b 0%,#ff6a9b 38%,#9b5cff 72%,#3aa0ff 100%)";

let mid = 0;
export const mkId = () => "L" + ++mid + Date.now().toString(36).slice(-3);
const baseLayer = (kind: LayerKind): Layer => ({ id: mkId(), name: kind, kind, visible: true, opacity: 100, x: 0, y: 0, scale: 100, rotate: 0 });

export function createLayer(kind: LayerKind, extra: Partial<Layer> = {}): Layer {
  const seed: Partial<Layer> = kind === "text"
    ? { name: "Text", text: "Your text", color: "#ffffff" }
    : kind === "shape" ? { name: "Shape", color: "#2f7bf6", shape: "rect" }
    : kind === "sticker" ? { name: "Sticker", emoji: "✨" }
    : kind === "html" ? { name: "Embed", html: '<div style="color:#fff;font:800 24px sans-serif;text-align:center">Edit HTML</div>' }
    : { name: "Image", tint: LAYER_TINTS[0] };
  return { ...baseLayer(kind), ...seed, ...extra };
}

export function freshInitialLayers(): Layer[] {
  return [
    createLayer("text", { name: "Headline", text: "Hello", y: -22, scale: 120 }),
    createLayer("image", { name: "Background", tint: PREVIEW_GRADIENT, base: true, scale: 100 }),
  ];
}
export const INITIAL_LAYERS = freshInitialLayers();

export type DocLayer = Omit<Layer, "x"|"y"|"scale"|"rotate"|"base"> & {
  z: number; transform: { x: number; y: number; scale: number; rotate: number };
};
export type LayerDoc = { format: "os-rr/layers@1"; canvas: { aspect: string }; adjustments: Adjustments; layers: DocLayer[] };

export function buildDoc(layers: Layer[], aspect: string, adjustments: Adjustments): LayerDoc {
  const n = layers.length;
  return { format: "os-rr/layers@1", canvas: { aspect }, adjustments, layers: layers.map((l, i) => ({
    ...l, z: n - i, transform: { x: l.x, y: l.y, scale: l.scale, rotate: l.rotate },
  })).map(({ x: _x, y: _y, scale: _s, rotate: _r, base: _b, ...rest }) => rest as DocLayer) };
}

export function downloadText(name: string, text: string, type: string) {
  const blob = new Blob([text], { type }); const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
