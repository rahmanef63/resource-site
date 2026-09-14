// Framework-neutral host seam for editor handoffs and remote media URLs.
export type MediaOpener = (
  appId: string,
  title?: string,
  size?: { w: number; h: number },
  payload?: unknown,
) => void;

let opener: MediaOpener = () => {};

/** Host wiring: route handoffs to your shell/editor (no-op until set). */
export function configureMediaOpener(fn: MediaOpener): void {
  opener = fn;
}

export function openWindow(
  appId: string,
  title?: string,
  size?: { w: number; h: number },
  payload?: unknown,
): void {
  opener(appId, title, size, payload);
}

export type MediaSource = { rawUrl: (path: string) => string };

let source: MediaSource = { rawUrl: (path) => path };

/** Host wiring: map fs paths to your media endpoint (identity by default). */
export function configureMediaSource(next: MediaSource): void {
  source = next;
}

export function rawUrl(path: string): string {
  return source.rawUrl(path);
}
