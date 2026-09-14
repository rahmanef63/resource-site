"use client";
import { useMemo, useSyncExternalStore } from "react";
import { createStudioStore } from "./studio-core";
export function useStudio() {
  const store = useMemo(() => createStudioStore(), []);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { ...state, ...store };
}
