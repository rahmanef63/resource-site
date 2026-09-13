"use client";

// React/appshell integration shims only. Telemetry contracts, mock/configure
// seam, stable API, and polling/history engine live in ./core so React and
// Svelte consume one SSOT.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { getSysmonApi } from "./core";

export {
  configureSysmon,
  createMockSys,
  getSysmonApi,
  type Process,
  type StatsHistorySnapshot,
  type StatsHistoryStore,
  type SysMonAdapter,
  type SysMonApi,
  type SysStats,
} from "./core";

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

// ── App descriptor (appshell-compatible; React-only rendering contract) ─────
export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

/** React compatibility hook around the stable framework-neutral API. */
export function useOsApi() {
  return getSysmonApi();
}
