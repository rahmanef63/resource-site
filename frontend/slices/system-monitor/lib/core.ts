import { clampPct } from "./format";

export type SysStats = {
  cpu: { pct: number; cores: number };
  mem: { used: number; total: number };
  disk: { used: number; total: number };
  net?: { rx: number; tx: number };
  uptime: number;
};

export type Process = {
  pid: number;
  name: string;
  status: string;
  cpu: number;
  mem: number;
};

export type SysMonAdapter = {
  mode: "mock" | "live";
  stats: () => Promise<SysStats>;
  processes: () => Promise<Process[]>;
};

export type SysMonApi = {
  readonly mode: SysMonAdapter["mode"];
  sys: {
    stats: () => Promise<SysStats>;
    processes: () => Promise<Process[]>;
  };
};

const GiB = 1024 ** 3;

export function createMockSys(random: () => number = Math.random): SysMonAdapter {
  let cpu = 34;
  return {
    mode: "mock",
    stats: async () => {
      cpu = Math.min(96, Math.max(4, cpu + (random() - 0.5) * 18));
      return {
        cpu: { pct: cpu, cores: 8 },
        mem: { used: 9 * GiB + random() * 4 * GiB, total: 31 * GiB },
        disk: { used: 88 * GiB, total: 200 * GiB },
        net: { rx: random() * 70, tx: random() * 20 },
        uptime: 14 * 864e5,
      };
    },
    processes: async () => [
      { pid: 142, name: "next-server", status: "running", cpu: 12, mem: 540 },
      { pid: 201, name: "postgres", status: "running", cpu: 7, mem: 142 },
      { pid: 318, name: "dockerd", status: "running", cpu: 3, mem: 88 },
      { pid: 402, name: "caddy", status: "running", cpu: 1, mem: 36 },
      { pid: 977, name: "node worker", status: "sleeping", cpu: 0, mem: 61 },
    ],
  };
}

let sysAdapter: SysMonAdapter = createMockSys();

/** Host wiring: swap the zero-config mock for real telemetry. */
export function configureSysmon(adapter: SysMonAdapter): void {
  sysAdapter = adapter;
}

/** Stable API identity so framework adapters can safely retain it in effects. */
const sysmonApi: SysMonApi = {
  get mode() {
    return sysAdapter.mode;
  },
  sys: {
    stats: () => sysAdapter.stats(),
    processes: () => sysAdapter.processes(),
  },
};

export function getSysmonApi(): SysMonApi {
  return sysmonApi;
}

export const SYSTEM_MONITOR_HISTORY_POINTS = 40;
export const SYSTEM_MONITOR_POLL_MS = 1500;

export type StatsHistorySnapshot = {
  stats: SysStats | null;
  procs: Process[];
  cpuSeries: number[];
  netSeries: number[];
  gpu: number;
};

export type StatsHistoryStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => StatsHistorySnapshot;
  refresh: () => Promise<void>;
  start: () => () => void;
};

type PollHandle = number | ReturnType<typeof setInterval>;

export type StatsHistoryOptions = {
  api?: SysMonApi;
  span?: number;
  pollMs?: number;
  random?: () => number;
  setIntervalFn?: (run: () => void, ms: number) => PollHandle;
  clearIntervalFn?: (id: PollHandle) => void;
};

export function createStatsHistoryStore(options: StatsHistoryOptions = {}): StatsHistoryStore {
  const api = options.api ?? getSysmonApi();
  const span = Math.max(2, Math.round(options.span ?? SYSTEM_MONITOR_HISTORY_POINTS));
  const pollMs = Math.max(100, Math.round(options.pollMs ?? SYSTEM_MONITOR_POLL_MS));
  const random = options.random ?? Math.random;
  const setIntervalFn = options.setIntervalFn ?? setInterval;
  const clearIntervalFn = options.clearIntervalFn ?? ((id: PollHandle) => clearInterval(id));
  let generation = 0;
  let interval: PollHandle | null = null;
  let gpu = 18;
  let snapshot: StatsHistorySnapshot = {
    stats: null,
    procs: [],
    cpuSeries: Array(span).fill(0),
    netSeries: Array(span).fill(0),
    gpu,
  };
  const listeners = new Set<() => void>();

  const emit = (next: StatsHistorySnapshot) => {
    snapshot = next;
    for (const listener of listeners) listener();
  };

  const refresh = async () => {
    const token = generation;
    const stats = await api.sys.stats();
    if (token !== generation) return;

    const net = stats.net ? stats.net.rx + stats.net.tx : 0;
    gpu = clampPct(gpu + (random() - 0.5) * 24);
    emit({
      ...snapshot,
      stats,
      cpuSeries: [...snapshot.cpuSeries.slice(1), clampPct(stats.cpu.pct)],
      netSeries: [...snapshot.netSeries.slice(1), Math.max(0, net)],
      gpu,
    });

    try {
      const procs = await api.sys.processes();
      if (token !== generation) return;
      emit({ ...snapshot, procs });
    } catch {
      // Stats remain useful even when the host cannot provide a process list.
    }
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    refresh,
    start() {
      if (interval !== null) return () => {};
      generation += 1;
      void refresh();
      interval = setIntervalFn(() => void refresh(), pollMs);
      return () => {
        generation += 1;
        if (interval !== null) clearIntervalFn(interval);
        interval = null;
      };
    },
  };
}
