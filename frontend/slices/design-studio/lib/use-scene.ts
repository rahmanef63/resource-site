"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createSceneStore } from "./scene-core";
export function useScene() {
  const store = useMemo(() => createSceneStore(), []);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => () => store.destroy(), [store]);
  return { ...state, ...store };
}
