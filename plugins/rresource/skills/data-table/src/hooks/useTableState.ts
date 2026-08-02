// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";

const PREFIX = "rresource:table:";

export function useTableState(key: string, initial: { page?: number; pageSize?: number } = {}) {
  const storageKey = PREFIX + key;
  const [state, setState] = React.useState(() => {
    if (typeof window === "undefined") return { page: initial.page ?? 0, pageSize: initial.pageSize ?? 20 };
    try { return JSON.parse(window.localStorage.getItem(storageKey) || "null") ?? { page: 0, pageSize: 20, ...initial }; }
    catch { return { page: 0, pageSize: 20, ...initial }; }
  });
  React.useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [storageKey, state]);
  return [state, setState] as const;
}
