import { useCallback } from "react";
import type Konva from "konva";
import type { Doc } from "./types";
import { buildProject, restorePaint, type Project } from "./project-core";
export { buildProject, restorePaint, downloadProject, parseProject, saveAutosave, loadAutosave, type Project } from "./project-core";

// Konva stage redraw shim (stage may be null before mount).
export const redrawStage = (stage: Konva.Stage | null) => stage?.draw();

// Save/restore the editable project, factored out of the store to keep it lean.
export function useProjectIO(deps: {
  doc: Doc;
  canvases: React.MutableRefObject<Map<string, HTMLCanvasElement>>;
  canvasFor: (id: string, w: number, h: number) => HTMLCanvasElement;
  setDoc: (d: Doc) => void;
  setSelected: (id: string | null) => void;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
}) {
  const { doc, canvases, canvasFor, setDoc, setSelected, stageRef } = deps;
  const exportProject = useCallback(() => buildProject(doc, canvases.current), [doc, canvases]);
  const loadProject = useCallback((p: Project) => {
    setDoc(p.doc);
    setSelected(p.doc.layers.at(-1)?.id ?? null);
    restorePaint(p, canvasFor, () => stageRef.current?.draw());
  }, [setDoc, setSelected, canvasFor, stageRef]);
  return { exportProject, loadProject };
}
