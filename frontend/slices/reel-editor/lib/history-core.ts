import type { Composition } from "./mock-timeline";
import { defaultComposition } from "./mock-timeline";
import { loadDraft } from "./draft";

const LIMIT = 60;
const COALESCE_MS = 400;

export type ReelHistorySnapshot = {
  comp: Composition;
  canUndo: boolean;
  canRedo: boolean;
};

export type ReelHistoryCore = {
  getSnapshot: () => ReelHistorySnapshot;
  subscribe: (listener: () => void) => () => void;
  apply: (fn: (c: Composition) => Composition, commit?: boolean) => void;
  commit: () => void;
  undo: () => void;
  redo: () => void;
  reset: (comp: Composition) => void;
};

export function createReelHistory(initial?: Composition): ReelHistoryCore {
  let comp = initial ?? loadDraft() ?? defaultComposition();
  let past: Composition[] = [];
  let future: Composition[] = [];
  let lastPush = 0;
  const listeners = new Set<() => void>();
  let snapshot: ReelHistorySnapshot = { comp, canUndo: false, canRedo: false };

  const refresh = () => {
    snapshot = { comp, canUndo: past.length > 0, canRedo: future.length > 0 };
  };
  const emit = () => {
    refresh();
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    apply(fn, force = false) {
      const next = fn(comp);
      if (next === comp) return;
      const now = Date.now();
      if (force || now - lastPush > COALESCE_MS) {
        past = [...past.slice(-(LIMIT - 1)), comp];
        future = [];
      }
      comp = next;
      lastPush = now;
      emit();
    },
    commit() {
      lastPush = 0;
    },
    undo() {
      if (!past.length) return;
      future = [comp, ...future].slice(0, LIMIT);
      comp = past[past.length - 1];
      past = past.slice(0, -1);
      lastPush = Date.now();
      emit();
    },
    reset(next) {
      comp = next; past = []; future = []; lastPush = 0; emit();
    },
    redo() {
      if (!future.length) return;
      past = [...past, comp].slice(-LIMIT);
      comp = future[0];
      future = future.slice(1);
      lastPush = Date.now();
      emit();
    },
  };
}
