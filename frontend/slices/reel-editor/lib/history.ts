"use client";

import { useRef, useSyncExternalStore } from "react";
import { createReelHistory, type ReelHistoryCore, type ReelHistorySnapshot } from "./history-core";

export type HistoryApi = ReelHistorySnapshot & Pick<ReelHistoryCore, "apply" | "commit" | "undo" | "redo">;

export function useHistory(): HistoryApi {
  const coreRef = useRef<ReelHistoryCore | null>(null);
  if (!coreRef.current) coreRef.current = createReelHistory();
  const core = coreRef.current;
  const state = useSyncExternalStore(core.subscribe, core.getSnapshot, core.getSnapshot);
  return {
    ...state,
    apply: core.apply,
    commit: core.commit,
    undo: core.undo,
    redo: core.redo,
  };
}
