import type { Doc } from "./types";

export type Project = { v: 1; doc: Doc; paint: Record<string, string> };

export function buildProject(doc: Doc, canvases: Map<string, HTMLCanvasElement>): Project {
  const paint: Record<string, string> = {};
  for (const layer of doc.layers) {
    if (layer.kind !== "paint") continue;
    const canvas = canvases.get(layer.id);
    if (canvas) paint[layer.id] = canvas.toDataURL();
  }
  return { v: 1, doc, paint };
}

export function restorePaint(
  project: Project,
  canvasFor: (id: string, w: number, h: number) => HTMLCanvasElement,
  redraw: () => void,
) {
  for (const [id, url] of Object.entries(project.paint)) {
    const canvas = canvasFor(id, project.doc.width, project.doc.height);
    const ctx = canvas.getContext("2d");
    const image = new window.Image();
    image.onload = () => {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(image, 0, 0);
      redraw();
    };
    image.src = url;
  }
  redraw();
}

export function downloadProject(project: Project, name = "project") {
  const blob = new Blob([JSON.stringify(project)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `${name}.ie.json`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function parseProject(text: string): Project | null {
  try {
    const project = JSON.parse(text);
    if (project && project.v === 1 && project.doc && Array.isArray(project.doc.layers)) return project as Project;
  } catch {}
  return null;
}

const KEY = "image-editor:autosave:v1";
export function saveAutosave(project: Project) {
  try { localStorage.setItem(KEY, JSON.stringify(project)); } catch {}
}
export function loadAutosave(): Project | null {
  try { const text = localStorage.getItem(KEY); return text ? parseProject(text) : null; } catch { return null; }
}
