import {
  createStatsHistoryStore,
  type StatsHistorySnapshot,
  type StatsHistoryStore,
} from "../../system-monitor/lib/core";

export type SvelteStatsHistoryStore = {
  subscribe: (run: (snapshot: StatsHistorySnapshot) => void) => () => void;
  getSnapshot: () => StatsHistorySnapshot;
  refresh: () => Promise<void>;
  start: () => () => void;
};

export function createSvelteStatsHistoryStore(): SvelteStatsHistoryStore {
  const core: StatsHistoryStore = createStatsHistoryStore();
  return {
    subscribe(run) {
      run(core.getSnapshot());
      return core.subscribe(() => run(core.getSnapshot()));
    },
    getSnapshot: core.getSnapshot,
    refresh: core.refresh,
    start: core.start,
  };
}
