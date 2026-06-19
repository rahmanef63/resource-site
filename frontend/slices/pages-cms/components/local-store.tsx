"use client";

import * as React from "react";
import { pagesReducer } from "../lib/reducer";
import { PagesProvider, type PagesStore } from "./pages-context";
import type { PageEntry, PagesAction } from "../types";

/**
 * Client-only, localStorage-backed pages store. Wrap your admin/demo
 * surface with <LocalPagesProvider seed={…}> and the PagesView /
 * PageEditorView read+write through it. No backend, no env — runs
 * anywhere. Swap for a Convex-backed provider in production.
 */
export function LocalPagesProvider({
  storageKey = "pages-cms:pages",
  seed = [],
  children,
}: {
  storageKey?: string;
  seed?: PageEntry[];
  children: React.ReactNode;
}) {
  const [pages, dispatch] = React.useReducer(
    (state: PageEntry[], action: PagesAction) => pagesReducer({ pages: state }, action).pages,
    seed,
  );
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate from localStorage on mount (falls back to seed on first run).
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PageEntry[];
        if (Array.isArray(parsed)) dispatch({ type: "PAGE_REPLACE_ALL", payload: parsed });
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist after hydration so we never clobber storage with the seed.
  React.useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(pages));
    } catch {
      /* quota / private mode — non-fatal */
    }
  }, [pages, hydrated, storageKey]);

  const store = React.useMemo<PagesStore>(
    () => ({
      pages,
      create: (entry) => dispatch({ type: "PAGE_CREATE", payload: entry }),
      update: (id, patch) => dispatch({ type: "PAGE_UPDATE", payload: { id, patch } }),
      remove: (id) => dispatch({ type: "PAGE_DELETE", payload: { id } }),
      reorderBlock: (id, from, to) => dispatch({ type: "PAGE_REORDER_BLOCK", payload: { id, from, to } }),
    }),
    [pages],
  );

  return <PagesProvider value={store}>{children}</PagesProvider>;
}
