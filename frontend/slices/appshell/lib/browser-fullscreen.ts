// Real browser Fullscreen API (F11-style), shared by every shell's right-click
// menu — distinct from use-full-screen.ts (macOS green-button per-WINDOW
// fullscreen via a synthetic Space). No reactive subscription: callers read
// this at ctxItems build-time, which is already fresh on every menu open
// (menu.open() sets state → re-render → array rebuilt).
export function isBrowserFullscreen(): boolean {
  return typeof document !== "undefined" && !!document.fullscreenElement;
}

export function toggleBrowserFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen();
}
