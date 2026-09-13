import {
  createCartStore,
  DEFAULT_CART_STORAGE_KEY,
  type CartItemInput,
  type CartSnapshot,
  type CartStore,
} from "../../storefront-checkout/lib/core";

export interface SvelteCartStore {
  subscribe: (run: (snapshot: CartSnapshot) => void) => () => void;
  getSnapshot: () => CartSnapshot;
  hydrateBrowser: () => void;
  add: (item: CartItemInput, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export function createSvelteCartStore(
  storageKey = DEFAULT_CART_STORAGE_KEY,
): SvelteCartStore {
  const core: CartStore = createCartStore(storageKey);
  let browserHydrated = false;

  return {
    subscribe(run) {
      run(core.getSnapshot());
      return core.subscribe(() => run(core.getSnapshot()));
    },
    getSnapshot: core.getSnapshot,
    hydrateBrowser() {
      if (browserHydrated || typeof window === "undefined") return;
      browserHydrated = true;
      core.hydrate(window.localStorage);
    },
    add: core.add,
    setQty: core.setQty,
    remove: core.remove,
    clear: core.clear,
  };
}
