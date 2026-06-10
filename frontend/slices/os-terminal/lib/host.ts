"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: useOsApi() defaults to the mock
// adapter in ./host-mock (mode "mock" — fs/exec/sys backed by the slice's own
// FsModel seed) and the shell inspector bus is a no-op. Wire a real backend
// with configureTerminal — in "live" mode ls/cat read through the adapter,
// file mutations mirror to it, host-truth commands (df/ps/whoami/uname/date)
// and unknown commands pass through exec.run (one-shot shell).

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { createMockOsApi } from "./host-mock";

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

// ── Terminal backend adapter (fs surface + one-shot exec + sys stats) ──────
export type FsEntry = { name: string; kind: "dir" | "file"; size?: number; ext?: string };
export type FsList = { path: string; entries: FsEntry[] };
export type ExecResult = { stdout: string; stderr: string; code: number };
/** Bytes for mem/disk, milliseconds for uptime — same contract as os-vps. */
export type SysStats = {
  cpu: { pct: number; cores: number };
  mem: { used: number; total: number };
  disk: { used: number; total: number };
  uptime: number;
};

export type TerminalOsApi = {
  /** "mock" = the in-memory FsModel is authoritative; "live" = read through + mirror writes. */
  mode: "mock" | "live";
  fs: {
    list: (path: string) => Promise<FsList>;
    read: (path: string) => Promise<string>;
    write: (path: string, content: string) => Promise<unknown>;
    mkdir: (path: string) => Promise<unknown>;
    remove: (path: string) => Promise<unknown>;
    move: (from: string, to: string) => Promise<unknown>;
    copy: (from: string, to: string) => Promise<unknown>;
  };
  exec: { run: (cmd: string, cwd?: string) => Promise<ExecResult> };
  /** Real stats feed `neofetch` in live mode; mock keeps the canned rows. */
  sys: { stats: () => Promise<SysStats> };
};

// ── Telemetry formatters (copied from os-vps lib/os-api/format) ────────────
const GiB = 1024 ** 3;

export function fmtGiBPair(used: number, total: number): string {
  return `${(used / GiB).toFixed(1)} / ${(total / GiB).toFixed(0)} GB`;
}

/** SysStats.uptime is milliseconds — render as "Nd Nh" (or "Nh"). */
export function fmtUptime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

// Lazy default keeps module init side-effect free.
let adapter: TerminalOsApi | null = null;
const current = (): TerminalOsApi => (adapter ??= createMockOsApi());

/** Host wiring: connect a real shell/fs backend and flip mode to "live". */
export function configureTerminal(a: TerminalOsApi): void {
  adapter = a;
}

// Stable identity — the component keeps `api` in refs/effect deps. Delegates
// live to the current adapter.
const api: TerminalOsApi = {
  get mode() {
    return current().mode;
  },
  fs: {
    list: (p) => current().fs.list(p),
    read: (p) => current().fs.read(p),
    write: (p, c) => current().fs.write(p, c),
    mkdir: (p) => current().fs.mkdir(p),
    remove: (p) => current().fs.remove(p),
    move: (a2, b) => current().fs.move(a2, b),
    copy: (a2, b) => current().fs.copy(a2, b),
  },
  exec: { run: (cmd, cwd) => current().exec.run(cmd, cwd) },
  sys: { stats: () => current().sys.stats() },
};

export function useOsApi(): TerminalOsApi {
  return api;
}
