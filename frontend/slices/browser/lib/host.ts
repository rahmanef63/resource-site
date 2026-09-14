"use client";

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  browserApi,
  configureBrowser,
  configureBrowserMode,
  configureScreencast,
  getBrowserMode,
  streamUrl,
  type AgentLogEntry,
  type BrowserAdapter,
  type BrowserMode,
  type RemoteState,
} from "./host-core";

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

export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

export function useBrowserMode(): BrowserMode {
  return getBrowserMode();
}

export function useBrowserApi(): BrowserAdapter {
  return browserApi;
}

export {
  browserApi,
  configureBrowser,
  configureBrowserMode,
  configureScreencast,
  getBrowserMode,
  streamUrl,
  type AgentLogEntry,
  type BrowserAdapter,
  type BrowserMode,
  type RemoteState,
} from "./host-core";
