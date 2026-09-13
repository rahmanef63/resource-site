import {
  getQuicklinksStore,
  type Quicklink,
  type QuicklinksStore,
} from "../../quicklinks/lib/core";

export type QuicklinksReadable = {
  subscribe: (run: (items: Quicklink[]) => void) => () => void;
};

/** Native Svelte store contract backed by the same injected QuicklinksStore. */
export const quicklinksStore: QuicklinksReadable = {
  subscribe(run) {
    const store = getQuicklinksStore();
    store.hydrate?.();
    run(store.get());
    return store.subscribe(() => run(store.get()));
  },
};

export function addQuicklink(url: string, title?: string): void {
  getQuicklinksStore().add(url, title);
}

export function removeQuicklink(id: string): void {
  getQuicklinksStore().remove(id);
}

export function currentQuicklinksStore(): QuicklinksStore {
  return getQuicklinksStore();
}
