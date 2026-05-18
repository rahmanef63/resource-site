"use client";

import * as React from "react";
import type { PageEntry } from "./types";

/** Store adapter — every template's StoreProvider wraps with PagesProvider
 *  and supplies these handlers from its own reducer dispatch. Keeps the
 *  shared admin views (PagesView / PageEditorView) template-agnostic. */
export type PagesStore = {
  pages: PageEntry[];
  create: (entry: PageEntry) => void;
  update: (id: string, patch: Partial<Omit<PageEntry, "id" | "createdAt">>) => void;
  remove: (id: string) => void;
  reorderBlock: (id: string, from: number, to: number) => void;
};

const Ctx = React.createContext<PagesStore | null>(null);

export function PagesProvider({
  value,
  children,
}: {
  value: PagesStore;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePagesStore(): PagesStore {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "usePagesStore must be called inside a PagesProvider. Wrap your template's StoreProvider with <PagesProvider value={…}>.",
    );
  }
  return ctx;
}

export function usePage(id: string | null | undefined): PageEntry | null {
  const { pages } = usePagesStore();
  return id ? pages.find((p) => p.id === id) ?? null : null;
}
