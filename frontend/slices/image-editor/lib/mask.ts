"use client";

import { useCallback } from "react";
import type { Layer } from "./types";
import { initMaskCanvas, maskKey } from "./mask-core";
export { initMaskCanvas, maskKey } from "./mask-core";

type Ops = {
  canvasFor: (id: string, w: number, h: number) => HTMLCanvasElement;
  canvases: React.MutableRefObject<Map<string, HTMLCanvasElement>>;
  update: (id: string, patch: Partial<Layer>) => void;
  docSize: () => { w: number; h: number };
  setMaskEdit: (id: string | null) => void;
};

// add/removeMask each call update() (a tracked doc step), so the masked-group
// re-caches off the shared history `version` — no separate mask revision needed.
export function useMaskOps({ canvasFor, canvases, update, docSize, setMaskEdit }: Ops) {
  // Adding a mask does NOT enter mask-edit — otherwise the brush would silently
  // paint the (hiding) mask instead of the layer. Editing the mask is a deliberate
  // toggle (the dashed-square button / "Edit mask" menu item).
  const addMask = useCallback((id: string) => {
    const { w, h } = docSize();
    initMaskCanvas(canvasFor(maskKey(id), w, h));
    update(id, { mask: true });
  }, [canvasFor, docSize, update]);

  const removeMask = useCallback((id: string) => {
    canvases.current.delete(maskKey(id));
    update(id, { mask: false });
    setMaskEdit(null);
  }, [canvases, update, setMaskEdit]);

  return { addMask, removeMask };
}
