import type { Doc } from "./types";

const LIMIT = 60;

export type HistAction =
  | { type: "doc"; before: Doc; after: Doc }
  | { type: "paint"; id: string; before: string; after: string };

export type HistorySnapshot = { rev: number; canUndo: boolean; canRedo: boolean };

export type ImageHistoryCore = {
  getSnapshot: () => HistorySnapshot;
  subscribe: (listener: () => void) => () => void;
  push: (action: HistAction) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

export function createImageHistory(apply: {
  doc: (doc: Doc) => void;
  paint: (id: string, dataUrl: string) => void;
}): ImageHistoryCore {
  let past: HistAction[] = [];
  let future: HistAction[] = [];
  let snapshot: HistorySnapshot = { rev: 0, canUndo: false, canRedo: false };
  const listeners = new Set<() => void>();
  const emit = () => {
    snapshot = { rev: snapshot.rev + 1, canUndo: past.length > 0, canRedo: future.length > 0 };
    listeners.forEach((listener) => listener());
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    push(action) { past = [...past.slice(-(LIMIT - 1)), action]; future = []; emit(); },
    undo() {
      const action = past.at(-1); if (!action) return;
      past = past.slice(0, -1); future = [action, ...future].slice(0, LIMIT);
      if (action.type === "doc") apply.doc(action.before); else apply.paint(action.id, action.before);
      emit();
    },
    redo() {
      const action = future[0]; if (!action) return;
      future = future.slice(1); past = [...past, action].slice(-LIMIT);
      if (action.type === "doc") apply.doc(action.after); else apply.paint(action.id, action.after);
      emit();
    },
    clear() { past = []; future = []; emit(); },
  };
}
