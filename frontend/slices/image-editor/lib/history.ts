"use client";

import { useRef, useSyncExternalStore } from "react";
import type { Doc } from "./types";
import { createImageHistory, type HistAction, type ImageHistoryCore } from "./history-core";

export type { HistAction } from "./history-core";

export function useHistory(apply: { doc: (d: Doc) => void; paint: (id: string, dataUrl: string) => void }) {
  const coreRef = useRef<ImageHistoryCore | null>(null);
  if (!coreRef.current) coreRef.current = createImageHistory(apply);
  const core = coreRef.current;
  const snap = useSyncExternalStore(core.subscribe, core.getSnapshot, core.getSnapshot);
  return { push: core.push, undo: core.undo, redo: core.redo, rev: snap.rev, canUndo: snap.canUndo, canRedo: snap.canRedo };
}
