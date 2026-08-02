"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: telemetry comes from a wavy
// in-browser mock generator and the shell inspector bus is a no-op.
// Lifting into a shell (e.g. the `appshell` slice): replace these exports
// with the shell's own `usePublishInspector` / sys api — every other file
// in the slice imports ONLY this seam.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

// ── Shell inspector bus — inert outside a shell ────────────────────────────
export type InspectorProp = { label: string; value: string };
export type InspectorAction = { id: string; label: string; run: () => void };
export type InspectorInfo = {
  subject?: string;
  props?: InspectorProp[];
  actions?: InspectorAction[];
  context?: string;
  suggestions?: string[];
};

export function usePublishInspector(_appId: string, _info: InspectorInfo, _deps: unknown[]): void {}

// ── App descriptor (appshell-compatible; minimal fields the barrel uses) ───
export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

// ── Telemetry adapter (stats + process list) ───────────────────────────────
export type SysStats = {
  cpu: { pct: number; cores: number };
  mem: { used: number; total: number };
  disk: { used: number; total: number };
  net?: { rx: number; tx: number };
  uptime: number;
};

export type Process = { pid: number; name: string; status: string; cpu: number; mem: number };

export type SysMonAdapter = {
  mode: "mock" | "live";
  stats: () => Promise<SysStats>;
  processes: () => Promise<Process[]>;
};

const GiB = 1024 ** 3;

/** Wavy in-browser telemetry so the dashboard is alive with zero backend. */
function createMockSys(): SysMonAdapter {
  let cpu = 34;
  return {
    mode: "mock",
    stats: async () => {
      cpu = Math.min(96, Math.max(4, cpu + (Math.random() - 0.5) * 18));
      return {
        cpu: { pct: cpu, cores: 8 },
        mem: { used: 9 * GiB + Math.random() * 4 * GiB, total: 31 * GiB },
        disk: { used: 88 * GiB, total: 200 * GiB },
        net: { rx: Math.random() * 70, tx: Math.random() * 20 },
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

/** Host wiring: swap the mock for real telemetry (VPS api, agent, /proc…). */
export function configureSysmon(adapter: SysMonAdapter): void {
  sysAdapter = adapter;
}

// Stable identity — components keep `api` in effect deps, so a fresh object
// per render would re-poll in a loop. Delegates live to the current adapter.
const api = {
  get mode() {
    return sysAdapter.mode;
  },
  sys: {
    stats: () => sysAdapter.stats(),
    processes: () => sysAdapter.processes(),
  },
};

export function useOsApi(): typeof api {
  return api;
}
