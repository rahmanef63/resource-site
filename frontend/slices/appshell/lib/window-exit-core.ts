import type { WinId } from "./types-core";
export type ExitKind = "close" | "minimize";
type ExitAnimator = (kind: ExitKind, done: () => void) => void;
const EXIT_FALLBACK_MS = 400;
const animators = new Map<WinId, ExitAnimator>();
const exiting = new Set<WinId>();

export function motionReduced(): boolean {
  if (typeof document === "undefined") return true;
  const root = document.documentElement;
  if (root.classList.contains("reduce-motion")) return true;
  if (root.classList.contains("force-motion")) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
export function requestExit(id: WinId, kind: ExitKind, commit: () => void): boolean {
  const animate = animators.get(id);
  if (!animate || exiting.has(id) || motionReduced()) return false;
  exiting.add(id);
  let done = false;
  const finish = () => { if (done) return; done = true; exiting.delete(id); commit(); };
  setTimeout(finish, EXIT_FALLBACK_MS);
  animate(kind, finish);
  return true;
}
export function registerExitAnimator(id: WinId, fn: ExitAnimator): () => void {
  animators.set(id, fn);
  return () => { animators.delete(id); };
}
export const WINDOW_EXIT_FALLBACK_MS = EXIT_FALLBACK_MS;
