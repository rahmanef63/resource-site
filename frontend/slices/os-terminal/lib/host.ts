"use client";

import { useSyncExternalStore, type ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { getOsApi, getTerminalMode, subscribeTerminal } from "./host-core";

export type InspectorProp = { label: string; value: string };
export type InspectorAction = { id: string; label: string; run: () => void };
export type InspectorInfo = {
  subject?: string;
  props?: InspectorProp[];
  actions?: InspectorAction[];
  context?: string;
  suggestions?: string[];
};

export function usePublishInspector(
  _appId: string,
  _info: InspectorInfo,
  _deps: unknown[],
): void {}

export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

export function useOsApi() {
  useSyncExternalStore(subscribeTerminal, getTerminalMode, getTerminalMode);
  return getOsApi();
}

export {
  configureTerminal,
  fmtGiBPair,
  fmtUptime,
  getOsApi,
  getTerminalMode,
  subscribeTerminal,
} from "./host-core";
export type {
  ExecResult,
  FsEntry,
  FsList,
  SysStats,
  TerminalOsApi,
} from "./host-core";
