import type { ShellState, WindowState, WinId } from "./types";

// Module-level external store, held in a mutable `M` object (not a rebindable
// `let`) so the action functions in store.ts can mutate ONE shared instance
// across files. The hot path (drag/resize) replaces ONE window object and
// notifies; React bails out on every window whose snapshot ref is unchanged
// (Object.is), so only the moved window re-renders — 60fps with 24 panes.

type Listener = () => void;

export const M = {
  state: {
    windows: {},
    order: [],
    focused: null,
    launcherOpen: false,
    spotlightOpen: false,
    inspectorOpen: false,
  } as ShellState,
  seq: 0,
};

const listeners = new Set<Listener>();

export function emit() {
  listeners.forEach((l) => l());
}

export const shellStore = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getWindow(id: WinId): WindowState | undefined {
    return M.state.windows[id];
  },
  getOrder(): WinId[] {
    return M.state.order;
  },
  getFocused(): WinId | null {
    return M.state.focused;
  },
  getLauncherOpen(): boolean {
    return M.state.launcherOpen;
  },
  getSpotlightOpen(): boolean {
    return M.state.spotlightOpen;
  },
  getInspectorOpen(): boolean {
    return M.state.inspectorOpen;
  },
};

// Per-window close guards: an app (e.g. the editor with unsaved changes) can veto
// a close. The guard returns false to BLOCK — it then drives its own confirm UI
// and, once resolved, clears itself via setCloseGuard(id, null) and calls
// closeWindow(id) again to actually close.
export const closeGuards = new Map<WinId, () => boolean>();
export function setCloseGuard(id: WinId, guard: (() => boolean) | null) {
  if (guard) closeGuards.set(id, guard);
  else closeGuards.delete(id);
}

export function topZ(): number {
  return M.state.order.reduce((m, id) => Math.max(m, M.state.windows[id]?.z ?? 0), 0);
}

export function patch(id: WinId, p: Partial<WindowState>) {
  const win = M.state.windows[id];
  if (!win) return;
  M.state = { ...M.state, windows: { ...M.state.windows, [id]: { ...win, ...p } } };
  emit();
}
