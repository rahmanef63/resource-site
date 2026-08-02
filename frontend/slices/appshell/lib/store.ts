import type { WindowState, WinId, PersistedWindow, SnapZone } from "./types";
import { M, emit, patch, topZ } from "./store-state";
import { GAP, workArea, snapRect, snapZoneAt, setChromeInsets, spawnRect } from "./store-geometry";
import { snapListeners } from "./store-panels";
import { requestExit } from "../hooks/use-window-exit";

// Public store barrel: window lifecycle + UI-panel actions. State + listeners
// live in store-state (`M`); pure geometry in store-geometry; panel toggles in
// store-panels. Re-exports keep `../lib/store` the single import site.
export { shellStore } from "./store-state";
export { snapRect, snapZoneAt, nextSnapZone, GAP } from "./store-geometry";
export { onSnap, setLauncherOpen, setSpotlightOpen, toggleSpotlight, setInspectorOpen, toggleInspector, setNotificationCenterOpen, toggleNotificationCenter } from "./store-panels";

/** Set the active shell's chrome insets AND re-tile every snapped/maximized
 *  window into the new work area (a maximized window would otherwise keep the
 *  previous shell's frozen height). Free-floating windows are left alone. */
export function applyChromeInsets(i: { top?: number; bottom?: number }) {
  setChromeInsets(i);
  retileSnapped();
}

export function retileSnapped() {
  if (typeof window === "undefined") return;
  const { vw, top, bottom } = workArea();
  M.state.order.forEach((id) => {
    const win = M.state.windows[id];
    if (!win || win.minimized) return;
    if (win.maximized) patch(id, { x: GAP, y: top, w: vw - GAP * 2, h: bottom - top });
    else if (win.snapZone) patch(id, snapRect(win.snapZone));
  });
}

export function openWindow(
  app: string,
  title: string,
  size?: { w: number; h: number },
  payload?: unknown,
  opts?: { multi?: boolean },
): WinId {
  // Singleton apps reuse their one window; `multi` apps always get a fresh one.
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
  const win: WindowState = {
    id, app, title,
    ...spawnRect(M.state.order.length, size?.w ?? 720, size?.h ?? 460),
    z: topZ() + 1,
    minimized: false, maximized: false,
    payload,
    spaceId: M.state.activeSpace,
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

// Close/minimize route through requestExit (use-window-exit.ts): a desktop
// frame's exit animation defers the commit, so EVERY caller animates. No
// animator (mobile/tests/reduce-motion) or exit in flight → instant commit.
export function closeWindow(id: WinId) {
  const win = M.state.windows[id];
  if (!win) return;
  if (!win.minimized && requestExit(id, "close", () => commitClose(id))) return;
  commitClose(id);
}

function commitClose(id: WinId) {
  if (!M.state.windows[id]) return; // fallback timer after an instant close
  const { [id]: _gone, ...rest } = M.state.windows;
  const order = M.state.order.filter((w) => w !== id);
  const focused = M.state.focused === id ? (order[order.length - 1] ?? null) : M.state.focused;
  M.state = { ...M.state, windows: rest, order, focused };
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
export function focusApp(app: string): boolean {
  const ids = M.state.order.filter((id) => M.state.windows[id]?.app === app);
  if (!ids.length) return false;
  const top = ids.reduce((a, b) => (M.state.windows[a].z >= M.state.windows[b].z ? a : b));
  if (M.state.windows[top].minimized) restoreWindow(top);
  focusWindow(top);
  return true;
}

export function moveWindow(id: WinId, x: number, y: number) {
  patch(id, { x, y, snapZone: undefined }); // free move leaves the snap grid
}
export function resizeWindow(id: WinId, w: number, h: number) {
  patch(id, { w, h, snapZone: undefined });
}
export function minimizeWindow(id: WinId) {
  const win = M.state.windows[id];
  if (!win || win.minimized) return;
  if (requestExit(id, "minimize", () => patch(id, { minimized: true }))) return;
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
    x: GAP, y: top, w: vw - GAP * 2, h: bottom - top,
    maximized: true,
    snapZone: undefined,
  });
}

export function snapWindow(id: WinId, zone: SnapZone) {
  const win = M.state.windows[id];
  if (!win) return;
  patch(id, {
    ...snapRect(zone),
    maximized: false,
    snapZone: zone,
    prevRect: { x: win.x, y: win.y, w: win.w, h: win.h },
  });
  // Snap-Assist pulse: a transient one-shot for half-snaps (left/right) so a
  // shell can offer the other windows for the empty half. Pure UI signal.
  if (zone === "left" || zone === "right") {
    snapListeners.forEach((cb) => cb({ id, zone }));
  }
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
    windows, order,
    focused: order[order.length - 1] ?? null,
    activeSpace: 1,
    launcherOpen: false, spotlightOpen: false,
    inspectorOpen: M.state.inspectorOpen,
    notificationCenterOpen: false,
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
