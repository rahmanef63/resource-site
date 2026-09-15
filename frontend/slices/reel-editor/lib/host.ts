"use client";

import * as React from "react";
import { toast as sonner } from "sonner";
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { getReelFsApi, paneBucket } from "./host-core";

export {
  configureReelFs,
  createMockReelFs,
  getReelFsAdapter,
  normalizeReelPath,
  rawUrl,
} from "./host-core";
export type { FsEntry, FsList, FsRoot, ReelFsAdapter, Pane } from "./host-core";

export type ToastTone = "default" | "success" | "error";
export type ToastOptions = { tone?: ToastTone; duration?: number };
export function toast(message: string, opts: ToastOptions = {}): void {
  if (opts.tone === "success") sonner.success(message, { duration: opts.duration });
  else if (opts.tone === "error") sonner.error(message, { duration: opts.duration });
  else sonner(message, { duration: opts.duration });
}

export type InspectorProp = { label: string; value: string };
export type InspectorAction = { id: string; label: string; run: () => void };
export type InspectorInfo = {
  subject?: string;
  props?: InspectorProp[];
  actions?: InspectorAction[];
  context?: string;
  suggestions?: string[];
};
export function setActivity(_id: string, _activity: { label: string; icon?: LucideIcon; [k: string]: unknown }): void {}
export function clearActivity(_id: string): void {}
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

export function useOsApi(): ReturnType<typeof getReelFsApi> {
  return getReelFsApi();
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

export function useContainer<T extends HTMLElement = HTMLElement>(): [React.RefObject<T | null>, "xs" | "sm" | "md" | "lg"] {
  const ref = React.useRef<T>(null);
  const [pane, setPane] = React.useState<"xs" | "sm" | "md" | "lg">("lg");
  React.useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      setPane(paneBucket(entries[0]?.contentRect.width ?? element.clientWidth));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, pane];
}

export { FilePicker } from "@/shared/ui/FilePicker";
export type { FilePickerHandle } from "@/shared/ui/FilePicker";
