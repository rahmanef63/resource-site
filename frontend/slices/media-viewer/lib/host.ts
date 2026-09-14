"use client";

// React/Next host-only descriptors and inspector seam. Framework-neutral
// opener/source configuration lives in host-core so Svelte can share it.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type AppProps = { payload?: unknown; winId?: string };

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
  noDock?: boolean;
};

export {
  configureMediaOpener,
  configureMediaSource,
  openWindow,
  rawUrl,
  type MediaOpener,
  type MediaSource,
} from "./host-core";
