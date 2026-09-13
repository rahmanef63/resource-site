import { describe, expect, it, vi } from "vitest";
import {
  createMockSys,
  createStatsHistoryStore,
  type SysMonApi,
  type SysStats,
} from "./core";

const GiB = 1024 ** 3;
const stats: SysStats = {
  cpu: { pct: 72, cores: 6 },
  mem: { used: 5 * GiB, total: 16 * GiB },
  disk: { used: 40 * GiB, total: 100 * GiB },
  net: { rx: 2.5, tx: 1.5 },
  uptime: 2 * 864e5,
};

function api(): SysMonApi {
  return {
    mode: "live",
    sys: {
      stats: vi.fn(async () => stats),
      processes: vi.fn(async () => [
        { pid: 7, name: "worker", status: "running", cpu: 9, mem: 64 },
      ]),
    },
  };
}

describe("system monitor core", () => {
  it("accumulates bounded CPU/network history and process rows", async () => {
    const store = createStatsHistoryStore({ api: api(), span: 3, random: () => 0.5 });
    await store.refresh();
    await store.refresh();
    expect(store.getSnapshot()).toMatchObject({ stats, gpu: 18 });
    expect(store.getSnapshot().cpuSeries).toEqual([0, 72, 72]);
    expect(store.getSnapshot().netSeries).toEqual([0, 4, 4]);
    expect(store.getSnapshot().procs[0]?.name).toBe("worker");
  });

  it("starts one poll loop and cleanup prevents stale in-flight writes", async () => {
    let tick: (() => void) | undefined;
    const clear = vi.fn();
    const store = createStatsHistoryStore({
      api: api(),
      setIntervalFn: ((run: () => void) => { tick = run; return 123 as never; }),
      clearIntervalFn: clear,
    });
    const stop = store.start();
    await Promise.resolve();
    tick?.();
    stop();
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it("ships deterministic-shape mock telemetry without a backend", async () => {
    const mock = createMockSys(() => 0.5);
    const one = await mock.stats();
    const processes = await mock.processes();
    expect(mock.mode).toBe("mock");
    expect(one.cpu.cores).toBe(8);
    expect(one.cpu.pct).toBeGreaterThanOrEqual(4);
    expect(one.cpu.pct).toBeLessThanOrEqual(96);
    expect(processes.length).toBeGreaterThan(0);
  });
});
