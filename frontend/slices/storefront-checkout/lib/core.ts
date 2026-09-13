export interface CartItem {
  /** Catalog slug — identity key and the server-side re-price key. */
  slug: string;
  name: string;
  /** Unit price in IDR. Client totals are display-only. */
  price: number;
  priceLabel: string;
  qty: number;
  emoji?: string;
  image?: string;
}

export type CartItemInput = Omit<CartItem, "qty">;

export interface CartStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface CartSnapshot {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: CartItemInput, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export interface CartStore {
  getSnapshot: () => CartSnapshot;
  subscribe: (run: () => void) => () => void;
  hydrate: (storage: CartStorage | null) => void;
  add: CartSnapshot["add"];
  setQty: CartSnapshot["setQty"];
  remove: CartSnapshot["remove"];
  clear: CartSnapshot["clear"];
}

export const DEFAULT_CART_STORAGE_KEY = "storefront-cart";
export const MAX_CART_QTY = 99;

export function clampCartQty(qty: number): number {
  return Math.max(1, Math.min(MAX_CART_QTY, Math.round(qty)));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function validStoredItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is CartItem => Boolean(item && typeof item === "object" && "slug" in item && (item as CartItem).slug))
    .map((item) => ({ ...item, qty: clampCartQty(item.qty) }));
}

export function createCartStore(
  storageKey = DEFAULT_CART_STORAGE_KEY,
): CartStore {
  let items: CartItem[] = [];
  let storage: CartStorage | null = null;
  let hydrated = false;
  const listeners = new Set<() => void>();
  let snapshot: CartSnapshot;

  const persist = () => {
    if (!hydrated || !storage) return;
    try {
      storage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Storage can be blocked/full; keep the cart in memory.
    }
  };

  const rebuild = () => {
    snapshot = {
      items,
      count: items.reduce((total, item) => total + item.qty, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.qty, 0),
      add,
      setQty,
      remove,
      clear,
    };
  };

  const emit = () => {
    rebuild();
    persist();
    for (const listener of listeners) listener();
  };

  const add: CartStore["add"] = (item, qty = 1) => {
    const existing = items.find((entry) => entry.slug === item.slug);
    items = existing
      ? items.map((entry) =>
          entry.slug === item.slug
            ? { ...entry, ...item, qty: clampCartQty(entry.qty + qty) }
            : entry,
        )
      : [...items, { ...item, qty: clampCartQty(qty) }];
    emit();
  };

  const setQty: CartStore["setQty"] = (slug, qty) => {
    items = qty <= 0
      ? items.filter((item) => item.slug !== slug)
      : items.map((item) =>
          item.slug === slug ? { ...item, qty: clampCartQty(qty) } : item,
        );
    emit();
  };

  const remove: CartStore["remove"] = (slug) => {
    items = items.filter((item) => item.slug !== slug);
    emit();
  };

  const clear: CartStore["clear"] = () => {
    items = [];
    emit();
  };

  const hydrate: CartStore["hydrate"] = (nextStorage) => {
    storage = nextStorage;
    items = [];
    if (storage) {
      try {
        const raw = storage.getItem(storageKey);
        if (raw) items = validStoredItems(JSON.parse(raw));
      } catch {
        // Corrupt/unavailable storage starts empty.
      }
    }
    hydrated = true;
    emit();
  };

  rebuild();
  return {
    getSnapshot: () => snapshot,
    subscribe(run) {
      listeners.add(run);
      return () => listeners.delete(run);
    },
    hydrate,
    add,
    setQty,
    remove,
    clear,
  };
}
