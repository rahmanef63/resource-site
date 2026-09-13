"use client";

import { useSyncExternalStore } from "react";
import type { NotificationsAdapter } from "../lib/adapter";
import {
  createNotificationsState,
  type NotificationsState,
} from "../lib/state";

export type UseNotifications = NotificationsState;

/** Bind a host-supplied adapter store to React while keeping state semantics
 * framework-neutral in `lib/state.ts`. */
export function useNotifications(adapter: NotificationsAdapter): UseNotifications {
  const snapshot = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getSnapshot,
  );
  return createNotificationsState(adapter, snapshot);
}
