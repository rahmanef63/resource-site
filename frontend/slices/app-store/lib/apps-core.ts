export type AppRow = {
  appId: string;
  title: string;
  glyph: string;
  gradient: string;
  runtime: string;
  entry: string;
  source: "custom" | "store";
  installed: boolean;
};

const KEY = "app-store:apps";
const EMPTY: AppRow[] = [];
let rows: AppRow[] | null = null;
const subs = new Set<() => void>();

function load(): AppRow[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? (parsed as AppRow[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function getAppsSnapshot(): AppRow[] {
  if (rows === null) rows = load();
  return rows;
}

export function getAppsServerSnapshot(): AppRow[] {
  return EMPTY;
}

export function subscribeApps(cb: () => void): () => void {
  subs.add(cb);
  return () => subs.delete(cb);
}

function commit(next: AppRow[]): void {
  rows = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // quota/private mode: in-memory state remains usable
    }
  }
  subs.forEach((fn) => fn());
}

export function setInstalled(p: Omit<AppRow, "source">): void {
  const cur = getAppsSnapshot();
  const i = cur.findIndex((app) => app.appId === p.appId);
  const next = cur.slice();
  if (i >= 0) next[i] = { ...next[i], ...p };
  else next.push({ source: "store", ...p });
  commit(next);
}

export function createApp(p: Omit<AppRow, "source" | "installed">): void {
  const cur = getAppsSnapshot();
  if (cur.some((app) => app.appId === p.appId)) throw new Error("App slug sudah dipakai");
  commit([...cur, { ...p, source: "custom", installed: true }]);
}
