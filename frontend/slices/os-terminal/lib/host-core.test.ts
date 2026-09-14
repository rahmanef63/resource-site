import { describe, expect, it, vi } from "vitest";
import {
  configureTerminal,
  fmtGiBPair,
  fmtUptime,
  getOsApi,
  getTerminalMode,
  subscribeTerminal,
  type TerminalOsApi,
} from "./host-core";

function liveApi(): TerminalOsApi {
  return {
    mode: "live",
    fs: {
      list: vi.fn(async (path) => ({ path, entries: [] })),
      read: vi.fn(async () => ""),
      write: vi.fn(async () => ({})),
      mkdir: vi.fn(async () => ({})),
      remove: vi.fn(async () => ({})),
      move: vi.fn(async () => ({})),
      copy: vi.fn(async () => ({})),
    },
    exec: { run: vi.fn(async () => ({ stdout: "", stderr: "", code: 0 })) },
    sys: {
      stats: vi.fn(async () => ({
        cpu: { pct: 1, cores: 1 },
        mem: { used: 1, total: 2 },
        disk: { used: 1, total: 2 },
        uptime: 0,
      })),
    },
  };
}

describe("os-terminal host core", () => {
  it("publishes adapter mode changes to framework renderers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTerminal(listener);
    configureTerminal(liveApi());
    expect(getTerminalMode()).toBe("live");
    expect(getOsApi().mode).toBe("live");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("keeps shared telemetry formatters framework-neutral", () => {
    expect(fmtGiBPair(1.5 * 1024 ** 3, 4 * 1024 ** 3)).toBe("1.5 / 4 GB");
    expect(fmtUptime((2 * 24 + 3) * 60 * 60 * 1000)).toBe("2d 3h");
  });
});
