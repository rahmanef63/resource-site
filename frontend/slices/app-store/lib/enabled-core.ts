const KEY = "app-store:disabled";
const EMPTY: string[] = [];
let ids: string[] | null = null;
const subs = new Set<() => void>();

export const MANDATORY = new Set<string>(["app-store"]);

function load(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? (parsed as string[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function getDisabledSnapshot(): string[] {
  if (ids === null) ids = load();
  return ids;
}

export function getDisabledServerSnapshot(): string[] {
  return EMPTY;
}

export function subscribeDisabled(cb: () => void): () => void {
  subs.add(cb);
  return () => subs.delete(cb);
}

function commit(next: string[]): void {
  ids = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // quota/private mode: in-memory state remains usable
    }
  }
  subs.forEach((fn) => fn());
}

export function setEnabled(id: string, on: boolean): void {
  if (!on && MANDATORY.has(id)) return;
  const cur = getDisabledSnapshot();
  const has = cur.includes(id);
  if (on && has) commit(cur.filter((value) => value !== id));
  else if (!on && !has) commit([...cur, id]);
}
