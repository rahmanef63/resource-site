export type Quicklink = { id: string; title: string; url: string };

/** Framework-neutral store surface consumed by both React and Svelte adapters. */
export type QuicklinksStore = {
  get: () => Quicklink[];
  subscribe: (listener: () => void) => () => void;
  add: (url: string, title?: string) => void;
  remove: (id: string) => void;
  hydrate?: () => void;
};

/** Bare host/path → https URL; leaves an existing http(s) scheme untouched. */
export function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/** Friendly default label from the host when none is given. */
export function titleFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Google s2 favicon URL for a URL host — null when the URL does not parse. */
export function faviconUrl(url: string): string | null {
  try {
    const host = new URL(normalizeUrl(url)).hostname;
    if (!host) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return null;
  }
}

/** Open a quicklink in a new native browser tab without opener access. */
export function openQuicklink(quicklink: Quicklink): void {
  if (typeof window !== "undefined") {
    window.open(quicklink.url, "_blank", "noopener,noreferrer");
  }
}

export const DEFAULT_QUICKLINKS: Quicklink[] = [
  { id: "gh", title: "GitHub", url: "https://github.com" },
  { id: "yt", title: "YouTube", url: "https://youtube.com" },
  { id: "wiki", title: "Wikipedia", url: "https://wikipedia.org" },
  { id: "mdn", title: "MDN", url: "https://developer.mozilla.org" },
];

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

function makeStore(seed: Quicklink[], persist?: (items: Quicklink[]) => void) {
  let items = seed.slice();
  const listeners = new Set<() => void>();
  const publish = (next: Quicklink[]) => {
    items = next;
    persist?.(items);
    listeners.forEach((listener) => listener());
  };

  return {
    get: () => items,
    replace: (next: Quicklink[]) => {
      items = next.slice();
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    add: (url: string, title?: string) => {
      const normalized = normalizeUrl(url);
      if (!normalized) return;
      publish([
        ...items,
        {
          id: newId(),
          url: normalized,
          title: title?.trim() || titleFromUrl(normalized),
        },
      ]);
    },
    remove: (id: string) => publish(items.filter((item) => item.id !== id)),
  };
}

/** In-memory store for previews, tests, and controlled hosts. */
export function createMemoryStore(seed: Quicklink[] = DEFAULT_QUICKLINKS): QuicklinksStore {
  const { replace: _replace, ...store } = makeStore(seed);
  return store;
}

/**
 * localStorage-backed store. Seeds are available during SSR; `hydrate()` restores
 * persisted state after mount, and edits persist back when storage is available.
 */
export function createLocalStore(
  key = "rr:quicklinks",
  seed: Quicklink[] = DEFAULT_QUICKLINKS,
): QuicklinksStore {
  let hydrated = false;
  const { replace, ...store } = makeStore(seed, (items) => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Storage can be unavailable in SSR, private mode, or quota failures.
    }
  });

  return {
    ...store,
    hydrate: () => {
      if (hydrated || typeof window === "undefined") return;
      hydrated = true;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Quicklink[];
        if (Array.isArray(parsed)) replace(parsed);
      } catch {
        // Malformed/unavailable storage keeps the seed state.
      }
    },
  };
}

let activeStore: QuicklinksStore = createLocalStore();

/** Host wiring seam shared by all framework adapters. Configure before mounting. */
export function configureQuicklinks(next: QuicklinksStore): void {
  activeStore = next;
}

/** Read the currently configured store without importing any framework runtime. */
export function getQuicklinksStore(): QuicklinksStore {
  return activeStore;
}
