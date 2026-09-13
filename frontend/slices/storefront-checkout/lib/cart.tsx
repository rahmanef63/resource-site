"use client";

import * as React from "react";
import {
  createCartStore,
  DEFAULT_CART_STORAGE_KEY,
  type CartSnapshot,
  type CartStore,
} from "./core";

export type { CartItem, CartSnapshot as CartContextValue } from "./core";
export { formatIDR } from "./core";

const CartContext = React.createContext<CartStore | null>(null);

export function CartProvider({
  children,
  storageKey = DEFAULT_CART_STORAGE_KEY,
}: {
  children: React.ReactNode;
  storageKey?: string;
}) {
  const store = React.useMemo(() => createCartStore(storageKey), [storageKey]);

  React.useEffect(() => {
    store.hydrate(window.localStorage);
  }, [store]);

  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

export function useCart(): CartSnapshot {
  const store = React.useContext(CartContext);
  if (!store) throw new Error("useCart must be used inside <CartProvider>");
  return React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
}
