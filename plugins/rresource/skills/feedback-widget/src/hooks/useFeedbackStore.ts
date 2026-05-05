// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";

type Item = { id: string; text: string; createdAt: number };
const KEY = "rresource:feedback:queue";

function read(): Item[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function useFeedbackStore() {
  const [items, setItems] = React.useState<Item[]>(() => read());
  function add(text: string) {
    const next = [...items, { id: crypto.randomUUID(), text, createdAt: Date.now() }];
    setItems(next);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  function clear() {
    setItems([]);
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
  }
  return { items, add, clear };
}
