"use client";

import { useEffect, useRef, useState } from "react";
import { createBroadcastSyncStore, type BroadcastSyncStore } from "../lib/store";

/** React adapter over the framework-neutral BroadcastChannel/storage transport. */
export function useBroadcastSync<T>(channelName: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initial);
  const valueRef = useRef(value);
  const storeRef = useRef<BroadcastSyncStore<T> | null>(null);
  valueRef.current = value;

  useEffect(() => {
    const store = createBroadcastSyncStore(channelName, valueRef.current);
    storeRef.current = store;
    const unsubscribe = store.subscribe(setValue);
    return () => {
      unsubscribe();
      store.destroy();
      if (storeRef.current === store) storeRef.current = null;
    };
  }, [channelName]);

  const set = (next: T) => {
    if (storeRef.current) storeRef.current.set(next);
    else setValue(next);
  };

  return [value, set];
}
