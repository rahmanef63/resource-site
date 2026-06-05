import type { WindowState, WinId, PersistedWindow, SnapZone } from "./types";
import { M, emit, patch, topZ, closeGuards } from "./store-state";
import { GAP, workArea, snapRect, snapZoneAt } from "./store-geometry";

// Public store barrel: window lifecycle + UI-panel actions. State + listeners
// live in store-state (the `M` holder); pure geometry in store-geometry. These
// re-exports keep `../lib/store` the single import site for every consumer.
export { shellStore, setCloseGuard } from "./store-state";
export { snapRect, snapZoneAt, GAP } from "./store-geometry";

export function openWindow(
  app: string,
  title: string,
  size?: { w: number; h: number },
  payload?: unknown,
  opts?: { multi?: boolean },
): WinId {
  // Singleton apps reuse their one window; `multi` apps (e.g. Files) always get
  // a fresh window so several can be open at once.
  if (!opts?.multi) {
    const existing = M.state.order.find((id) => M.state.windows[id].app === app);
    if (existing) {
      // Re-opening with fresh context (e.g. a different file) updates the payload.
      if (payload !== undefined) patch(existing, { payload });
      focusWindow(existing);
      if (M.state.windows[existing].minimized) restoreWindow(existing);
      return existing;
    }
  }
  const id = `w${++M.seq}`;
  const offset = (M.state.order.length % 6) * 28;
  const win: WindowState = {
    id,
    app,
    title,
    x: 80 + offset,
    y: 64 + offset,
    w: size?.w ?? 720,
    h: size?.h ?? 460,
    z: topZ() + 1,
    minimized: false,
    maximized: false,
    payload,
  };
  M.state = {
    ...M.state,
    windows: { ...M.state.windows, [id]: win },
    order: [...M.state.order, id],
    focused: id,
    launcherOpen: false,
  };
  emit();
  return id;
}

export function closeWindow(id: WinId) {
  if (!M.state.windows[id]) return;
  const guard = closeGuards.get(id);
  if (guard && !guard()) return; // vetoed — the guard handles its own confirm flow
  closeGuards.delete(id);
  const { [id]: _gone, ...rest } = M.state.windows;
  const order = M.state.order.filter((w) => w !== id);
  M.state = {
    ...M.state,
    windows: rest,
    order,
    focused: M.state.focused === id ? (order[order.length - 1] ?? null) : M.state.focused,
  };
  emit();
}

export function focusWindow(id: WinId) {
  const win = M.state.windows[id];
  if (!win || M.state.focused === id) return;
  M.state = {
    ...M.state,
    windows: { ...M.state.windows, [id]: { ...win, z: topZ() + 1 } },
    focused: id,
  };
  emit();
}

// Reveal the front-most existing window of an app (restoring if minimized).
// Returns false when none exist — callers then decide whether to open one.
// Lets the URL sync focus an app without spawning a duplicate for `multi` apps.
export function focusApp(app: string): boolean {
  const ids = M.state.order.filter((id) => M.state.windows[id]?.app === app);
  if (!ids.length) return false;
  const top = ids.reduce((a, b) => (M.state.windows[a].z >= M.state.windows[b].z ? a : b));
  if (M.state.windows[top].minimized) restoreWindow(top);
  focusWindow(top);
  return true;
}

export function moveWindow(id: WinId, x: number, y: number) {
  patch(id, { x, y });
}
export function resizeWindow(id: WinId, w: number, h: number) {
  patch(id, { w, h });
}
export function minimizeWindow(id: WinId) {
  patch(id, { minimized: true });
}
export function restoreWindow(id: WinId) {
  patch(id, { minimized: false });
  focusWindow(id);
}
export function toggleMaximize(id: WinId) {
  const win = M.state.windows[id];
  if (!win) return;
  if (win.maximized) {
    const r = win.prevRect ?? { x: win.x, y: win.y, w: win.w, h: win.h };
    patch(id, { ...r, maximized: false, prevRect: undefined });
    return;
  }
  const { vw, top, bottom } = workArea();
  patch(id, {
    prevRect: { x: win.x, y: win.y, w: win.w, h: win.h },
    x: GAP,
    y: top,
    w: vw - GAP * 2,
    h: bottom - top,
    maximized: true,
  });
}

export function snapWindow(id: WinId, zone: SnapZone) {
  const win = M.state.windows[id];
  if (!win) return;
  patch(id, {
    ...snapRect(zone),
    maximized: false,
    prevRect: { x: win.x, y: win.y, w: win.w, h: win.h },
  });
}
export function setLauncherOpen(open: boolean) {
  M.state = { ...M.state, launcherOpen: open };
  emit();
}
export function setSpotlightOpen(open: boolean) {
  M.state = { ...M.state, spotlightOpen: open };
  emit();
}
export function toggleSpotlight() {
  setSpotlightOpen(!M.state.spotlightOpen);
}
export function setInspectorOpen(open: boolean) {
  M.state = { ...M.state, inspectorOpen: open };
  emit();
}
export function toggleInspector() {
  setInspectorOpen(!M.state.inspectorOpen);
}

/** Bulk window ops surfaced as Spotlight commands. */
export function minimizeAll() {
  M.state.order.forEach((id) => minimizeWindow(id));
}
export function closeAll() {
  [...M.state.order].forEach((id) => closeWindow(id));
}

/** Hydrate persisted layout (localStorage). Apps re-open lazily. */
export function hydrate(persisted: PersistedWindow[]) {
  const windows: Record<WinId, WindowState> = {};
  const order: WinId[] = [];
  persisted.forEach((p, i) => {
    windows[p.id] = { ...p, z: i + 1 };
    order.push(p.id);
    const n = Number(p.id.replace(/\D/g, ""));
    if (n > M.seq) M.seq = n;
  });
  M.state = {
    windows,
    order,
    focused: order[order.length - 1] ?? null,
    launcherOpen: false,
    spotlightOpen: false,
    inspectorOpen: M.state.inspectorOpen,
  };
  emit();
}

/** Snapshot for persistence — strips volatile z/focus. */
export function serialize(): PersistedWindow[] {
  return M.state.order.map((id) => {
    const { z: _z, ...rest } = M.state.windows[id];
    return rest;
  });
}
