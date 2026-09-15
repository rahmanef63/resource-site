"use client";

import { useRef, useSyncExternalStore } from "react";
import { createFsHistory } from "../lib/history-core";

// React wrapper over the framework-neutral history core. Every hook instance
// owns its own browser-style stack while Svelte/other renderers can subscribe
// to the same core directly.
export function useFsHistory(start: string) {
  const coreRef = useRef<ReturnType<typeof createFsHistory> | null>(null);
  if (!coreRef.current) coreRef.current = createFsHistory(start);
  const core = coreRef.current;
  const state = useSyncExternalStore(core.subscribe, core.getSnapshot, core.getSnapshot);
  return {
    ...state,
    navigate: core.navigate,
    goBack: core.goBack,
    goForward: core.goForward,
  };
}
