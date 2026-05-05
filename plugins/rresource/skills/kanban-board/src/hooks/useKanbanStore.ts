// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";

export type Card = { id: string; title: string; column: string };
type Store = { cards: Card[]; move: (id: string, toCol: string) => void; add: (card: Omit<Card, "id">) => void; remove: (id: string) => void };

const KEY = "rresource:kanban:";

function read(boardId: string): Card[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY + boardId) || "[]"); } catch { return []; }
}

export function useKanbanStore(boardId: string, seed: Card[] = []): Store {
  const [cards, setCards] = React.useState<Card[]>(() => {
    const r = read(boardId);
    return r.length ? r : seed;
  });
  React.useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(KEY + boardId, JSON.stringify(cards));
  }, [boardId, cards]);
  return {
    cards,
    move: (id, toCol) => setCards((cs) => cs.map((c) => c.id === id ? { ...c, column: toCol } : c)),
    add: (c) => setCards((cs) => [...cs, { ...c, id: crypto.randomUUID() }]),
    remove: (id) => setCards((cs) => cs.filter((c) => c.id !== id)),
  };
}
