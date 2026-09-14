"use client";

// React/appshelly integration seam. Filesystem + editor state live in portable
// core modules so React and Svelte share the same behavior.

import * as React from "react";
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { getCodeFs } from "./fs-core";

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
};

const api = { fs: getCodeFs() };
export function useOsApi() {
  return api;
}

const MOBILE_BREAKPOINT = 768;
export function useIsMobile(): boolean {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setMobile(window.innerWidth < MOBILE_BREAKPOINT);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return mobile;
}

export { configureCodeFs } from "./fs-core";
export type { CodeFsAdapter, FsEntry, FsList } from "./fs-core";
