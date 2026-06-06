/** notifications-center — adapter contract + in-memory reference impl.
 *
 *  The host owns the feed. Wire a Convex/websocket adapter by implementing
 *  `NotificationsAdapter`; the bundled `createMemoryNotificationsAdapter`
 *  is a useSyncExternalStore-friendly store for demos + offline drafts. */

import type { Notification } from "./types";

export type NotificationsAdapter = {
  /** Current feed snapshot (newest-first is the host's call; the UI sorts by
   *  `createdAt` defensively). */
  list(): Notification[];
  markRead(id: string): void;
  markAllRead(): void;
  dismiss(id: string): void;
  clear(): void;
  /** useSyncExternalStore subscription — return an unsubscribe fn. */
  subscribe(listener: () => void): () => void;
  /** Stable reference between mutations (required by useSyncExternalStore). */
  getSnapshot(): Notification[];
};

/** In-memory adapter: an array + a listener set. Every mutation swaps the
 *  array reference so `getSnapshot` identity changes drive React updates. */
export function createMemoryNotificationsAdapter(
  seed: Notification[] = [],
): NotificationsAdapter {
  let items: Notification[] = [...seed];
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const l of listeners) l();
  };
  const patch = (next: Notification[]) => {
    items = next;
    emit();
  };

  return {
    list: () => items,
    getSnapshot: () => items,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    markRead(id) {
      if (!items.some((n) => n.id === id && !n.read)) return;
      patch(items.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    markAllRead() {
      if (!items.some((n) => !n.read)) return;
      patch(items.map((n) => (n.read ? n : { ...n, read: true })));
    },
    dismiss(id) {
      const next = items.filter((n) => n.id !== id);
      if (next.length === items.length) return;
      patch(next);
    },
    clear() {
      if (items.length === 0) return;
      patch([]);
    },
  };
}
