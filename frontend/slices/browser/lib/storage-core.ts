export type HistoryEntry = { url: string; title: string; time: number };
export type Bookmark = { url: string; title: string };

export function readStored<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  } catch {
    return initial;
  }
}

export function writeStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota/private mode is non-fatal
  }
}

export function relTime(t: number): string {
  const seconds = (Date.now() - t) / 1000;
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
