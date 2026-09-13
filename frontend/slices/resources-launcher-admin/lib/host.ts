"use client";

// React/appshelly host seam. Portable resource data, adapter behavior and
// ordering live in lib/core.ts so non-React distributions share one SSOT.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  configureResources,
  resourcesApi,
  type Resource,
  type ResourceInput,
  type ResourcesAdapter,
} from "./core";

export type InspectorInfo = {
  subject?: string;
  props?: { label: string; value: string }[];
  actions?: { id: string; label: string; run: () => void }[];
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

export { configureResources };
export type { Resource, ResourceInput, ResourcesAdapter };

/** Backward-compatible React seam; the returned API itself is framework-neutral. */
export function useResourcesApi(): typeof resourcesApi {
  return resourcesApi;
}
