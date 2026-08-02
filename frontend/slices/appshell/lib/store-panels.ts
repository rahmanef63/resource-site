import type { WinId, SnapZone } from "./types";
import { M, emit } from "./store-state";

// UI-panel toggles + the snap-pulse listener machinery, split out of store.ts
// to keep every file <=200 LOC. These actions touch ONLY the chrome/open-flag
// state (launcher/spotlight/inspector/notification-center) and the transient
// Snap-Assist signal — no window lifecycle — so they form a cohesive group that
// is re-exported verbatim from `./store`. Importers stay byte-identical.

type SnapPulse = { id: WinId; zone: SnapZone };
type SnapListener = (e: SnapPulse) => void;
// Shared with store.ts's snapWindow, which fires a pulse on half-snaps.
export const snapListeners = new Set<SnapListener>();
/** Subscribe to half-snap pulses (Windows Snap-Assist). Returns an unsubscribe. */
export function onSnap(cb: SnapListener): () => void {
  snapListeners.add(cb);
  return () => {
    snapListeners.delete(cb);
  };
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
export function setNotificationCenterOpen(open: boolean) {
  M.state = { ...M.state, notificationCenterOpen: open };
  emit();
}
export function toggleNotificationCenter() {
  setNotificationCenterOpen(!M.state.notificationCenterOpen);
}
