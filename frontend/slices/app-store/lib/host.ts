"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: the app registry (created +
// installed apps) lives in localStorage, the shell inspector bus is a no-op,
// and the command-app console runs on a demo exec until the host wires a
// real one-shot shell with configureAppStoreExec.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

// ── App props + descriptor (appshell-compatible) ───────────────────────────
export type AppProps = { payload?: unknown; winId?: string };

export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
  noDock?: boolean;
};

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

// ── Exec adapter (the console for command/script apps) ─────────────────────
export type ExecResult = { stdout: string; stderr: string; code: number };
export type AppStoreExec = {
  mode: "mock" | "live";
  exec: { run: (cmd: string, cwd?: string) => Promise<ExecResult> };
};

let adapter: AppStoreExec = {
  mode: "mock",
  exec: {
    run: async (cmd) => ({
      stdout: `demo exec — would run: ${cmd}\nWire configureAppStoreExec({ mode:"live", exec }) to hit a real shell.`,
      stderr: "",
      code: 0,
    }),
  },
};

/** Host wiring: run command/script apps on a real one-shot shell. */
export function configureAppStoreExec(a: AppStoreExec): void {
  adapter = a;
}

// Stable identity — components keep `api` in effect deps.
const api = {
  get mode() {
    return adapter.mode;
  },
  exec: { run: (cmd: string, cwd?: string) => adapter.exec.run(cmd, cwd) },
};

export function useOsApi(): typeof api {
  return api;
}
