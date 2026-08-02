"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: quicklinks live in a small
// localStorage-backed store (seeded with demo links). Lifting into a shell:
// call `configureQuicklinks()` with the host's own store — every other file
// in the slice imports ONLY this seam.

import { useEffect, useState, type ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type Quicklink = { id: string; title: string; url: string };

/** The store surface the app consumes. Hosts inject their own via
 *  `configureQuicklinks()`; `hydrate` is an optional post-mount restore hook
 *  (the local store uses it to read localStorage without SSR mismatch). */
export type QuicklinksStore = {
  get: () => Quicklink[];
  subscribe: (listener: () => void) => () => void;
  add: (url: string, title?: string) => void;
  remove: (id: string) => void;
  hydrate?: () => void;
};

// ── App descriptor (appshell-compatible; minimal fields the barrel uses) ───
export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

// ── URL helpers ─────────────────────────────────────────────────────────────

/** Bare host/path → https URL; leaves an existing scheme untouched. */
export function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

/** Friendly default label from the host when none is given. */
export function titleFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Google s2 favicon for a URL's host — null when the URL doesn't parse. */
export function faviconUrl(url: string): string | null {
  try {
    const host = new URL(normalizeUrl(url)).hostname;
    if (!host) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return null;
  }
}

/** Open a quicklink in a new native browser tab (rel=noopener). */
export function openQuicklink(ql: Quicklink): void {
  if (typeof window !== "undefined") window.open(ql.url, "_blank", "noopener,noreferrer");
}

// ── Stores ──────────────────────────────────────────────────────────────────

export const DEFAULT_QUICKLINKS: Quicklink[] = [
  { id: "gh", title: "GitHub", url: "https://github.com" },
  { id: "yt", title: "YouTube", url: "https://youtube.com" },
  { id: "wiki", title: "Wikipedia", url: "https://wikipedia.org" },
  { id: "mdn", title: "MDN", url: "https://developer.mozilla.org" },
];

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID().slice(0, 8);
  return Math.random().toString(36).slice(2, 10);
}

function makeStore(seed: Quicklink[], persist?: (items: Quicklink[]) => void) {
  let items = seed;
  const listeners = new Set<() => void>();
  const set = (next: Quicklink[]) => {
    items = next;
    persist?.(items);
    listeners.forEach((l) => l());
  };
  return {
    get: () => items,
    /** Internal: replace the list without persisting (hydration). */
    replace: (next: Quicklink[]) => {
      items = next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    add: (url: string, title?: string) => {
      const u = normalizeUrl(url);
      if (!u) return;
      set([...items, { id: newId(), url: u, title: title?.trim() || titleFromUrl(u) }]);
    },
    remove: (id: string) => set(items.filter((x) => x.id !== id)),
  };
}

/** In-memory store (previews, tests, controlled hosts). */
export function createMemoryStore(seed: Quicklink[] = DEFAULT_QUICKLINKS): QuicklinksStore {
  const { replace: _replace, ...store } = makeStore(seed);
  return store;
}

/** localStorage-backed store: seeds render first (SSR-safe), then `hydrate()`
 *  restores the persisted list after mount; every edit persists back. */
export function createLocalStore(
  key = "rr:quicklinks",
  seed: Quicklink[] = DEFAULT_QUICKLINKS,
): QuicklinksStore {
  let hydrated = false;
  const { replace, ...store } = makeStore(seed, (items) => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* quota / private mode */
    }
  });
  return {
    ...store,
    hydrate: () => {
      if (hydrated || typeof window === "undefined") return;
      hydrated = true;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as Quicklink[];
          if (Array.isArray(parsed)) replace(parsed);
        }
      } catch {
        /* malformed cache — keep seeds */
      }
    },
  };
}

let store: QuicklinksStore = createLocalStore();

/** Host wiring: swap the local store for the host's own quicklinks source. */
export function configureQuicklinks(next: QuicklinksStore): void {
  store = next;
}

/** Live quicklinks list + edit actions, from whichever store is configured. */
export function useQuicklinks(): {
  items: Quicklink[];
  add: QuicklinksStore["add"];
  remove: QuicklinksStore["remove"];
} {
  const [items, setItems] = useState<Quicklink[]>(() => store.get());
  useEffect(() => {
    const s = store;
    s.hydrate?.();
     
    setItems(s.get());
    return s.subscribe(() => setItems(s.get()));
  }, []);
  return { items, add: (url, title) => store.add(url, title), remove: (id) => store.remove(id) };
}
