import type { NotificationsAdapter } from "../../notifications-center/lib/adapter";
import {
  createNotificationsState,
  type NotificationsState,
} from "../../notifications-center/lib/state";

export type NotificationsStore = {
  subscribe: (run: (state: NotificationsState) => void) => () => void;
};

/** Svelte-readable adapter without importing svelte/store into the TS core. */
export function createNotificationsStore(
  adapter: NotificationsAdapter,
): NotificationsStore {
  return {
    subscribe(run) {
      run(createNotificationsState(adapter));
      return adapter.subscribe(() => run(createNotificationsState(adapter)));
    },
  };
}
