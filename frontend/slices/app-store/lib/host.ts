"use client";

import { useSyncExternalStore, type ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  appStoreExecApi,
  configureAppStoreExec,
  getAppStoreExecRevision,
  subscribeAppStoreExec,
  type AppStoreExec,
  type ExecResult,
} from "./exec-core";

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

export function useOsApi(): typeof appStoreExecApi {
  useSyncExternalStore(subscribeAppStoreExec, getAppStoreExecRevision, () => 0);
  return appStoreExecApi;
}

export { configureAppStoreExec, type AppStoreExec, type ExecResult } from "./exec-core";
