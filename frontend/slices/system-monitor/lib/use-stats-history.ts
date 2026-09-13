"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  createStatsHistoryStore,
  type Process,
  type StatsHistoryStore,
  type SysStats,
} from "./core";

export type StatsHistory = {
  stats: SysStats | null;
  procs: Process[];
  cpuSeries: number[];
  netSeries: number[];
  gpu: number;
  refresh: () => void;
};

/** React adapter over the framework-neutral telemetry history store. */
export function useStatsHistory(): StatsHistory {
  const [store] = useState<StatsHistoryStore>(() => createStatsHistoryStore());
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => store.start(), [store]);

  return {
    ...snapshot,
    refresh: () => void store.refresh(),
  };
}
