// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

export type AuditEntry = {
  id: string;
  action: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  createdAt: number;
};

const KEY = "rresource:audit:log";

export function logAuditLocal(entry: Omit<AuditEntry, "id" | "createdAt">): void {
  if (typeof window === "undefined") return;
  const arr: AuditEntry[] = JSON.parse(window.localStorage.getItem(KEY) || "[]");
  arr.push({ id: crypto.randomUUID(), createdAt: Date.now(), ...entry });
  if (arr.length > 1000) arr.splice(0, arr.length - 1000);
  window.localStorage.setItem(KEY, JSON.stringify(arr));
}

export function readAuditLocal(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem(KEY) || "[]");
}

export function clearAuditLocal(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
