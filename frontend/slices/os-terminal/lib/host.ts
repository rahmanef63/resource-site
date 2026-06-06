"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: the emulator's own in-memory
// FsModel handles every command in "mock" mode, and the shell inspector bus
// is a no-op. Wire a real backend with configureTerminal — in "live" mode
// ls/cat read through the adapter, file mutations mirror to it, and unknown
// commands pass through exec.run (one-shot shell).

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

// ── Terminal backend adapter (fs surface + one-shot exec) ──────────────────
export type FsEntry = { name: string; kind: "dir" | "file"; size?: number; ext?: string };
export type FsList = { path: string; entries: FsEntry[] };
export type ExecResult = { stdout: string; stderr: string; code: number };

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
};

const notLive = async (): Promise<never> => {
  throw new Error("terminal: no live backend configured (configureTerminal)");
};

let adapter: TerminalOsApi = {
  mode: "mock",
  fs: { list: notLive, read: notLive, write: notLive, mkdir: notLive, remove: notLive, move: notLive, copy: notLive },
  exec: { run: notLive },
};

/** Host wiring: connect a real shell/fs backend and flip mode to "live". */
export function configureTerminal(a: TerminalOsApi): void {
  adapter = a;
}

// Stable identity — the component keeps `api` in refs/effect deps. Delegates
// live to the current adapter.
const api: TerminalOsApi = {
  get mode() {
    return adapter.mode;
  },
  fs: {
    list: (p) => adapter.fs.list(p),
    read: (p) => adapter.fs.read(p),
    write: (p, c) => adapter.fs.write(p, c),
    mkdir: (p) => adapter.fs.mkdir(p),
    remove: (p) => adapter.fs.remove(p),
    move: (a2, b) => adapter.fs.move(a2, b),
    copy: (a2, b) => adapter.fs.copy(a2, b),
  },
  exec: { run: (cmd, cwd) => adapter.exec.run(cmd, cwd) },
};

export function useOsApi(): TerminalOsApi {
  return api;
}
