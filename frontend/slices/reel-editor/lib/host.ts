"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: toasts go to sonner, shell
// services (inspector / activity) are no-ops you can rewire, and the fs
// browser runs on an injectable adapter (in-memory mock by default).
// Lifting into a shell (e.g. the `appshell` slice): replace these exports
// with the shell's own `toast` / `usePublishInspector` / `setActivity` /
// `useContainer` / fs api — every other file in the slice imports ONLY this
// seam (`./host` from lib, `../lib/host` from components).

import * as React from "react";
import { toast as sonner } from "sonner";
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

// ── Toast (sonner-backed shim, same call shape as the appshell toast) ──────
export type ToastTone = "default" | "success" | "error";
export type ToastOptions = { tone?: ToastTone; duration?: number };

export function toast(message: string, opts: ToastOptions = {}): void {
  if (opts.tone === "success") sonner.success(message, { duration: opts.duration });
  else if (opts.tone === "error") sonner.error(message, { duration: opts.duration });
  else sonner(message, { duration: opts.duration });
}

// ── Shell activity + inspector buses — inert outside a shell ───────────────
export type InspectorProp = { label: string; value: string };
export type InspectorAction = { id: string; label: string; run: () => void };
export type InspectorInfo = {
  subject?: string;
  props?: InspectorProp[];
  actions?: InspectorAction[];
  context?: string;
  suggestions?: string[];
};

export function setActivity(_id: string, _a: { label: string; icon?: LucideIcon; [k: string]: unknown }): void {}
export function clearActivity(_id: string): void {}
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

// ── Filesystem adapter (quick-import pane + VPS browser dialog) ────────────
export type FsEntry = { name: string; kind: "dir" | "file"; size: number; ext?: string; mime?: string };
export type FsRoot = { label: string; path: string };
export type FsList = { path: string; entries: FsEntry[]; roots?: FsRoot[]; parent?: string | null };

export type ReelFsAdapter = {
  list: (path: string) => Promise<FsList>;
  mkdir: (path: string) => Promise<unknown>;
  /** Resolve a listed file path to a fetchable media URL. */
  rawUrl: (path: string) => string;
};

/** Expand "~" and normalise to an absolute mock path. */
function norm(p: string): string {
  const x = p.replace(/^~(?=\/|$)/, "");
  const abs = x.startsWith("/") ? x : `/${x}`;
  return abs !== "/" && abs.endsWith("/") ? abs.slice(0, -1) : abs || "/";
}

/** In-memory mock fs: dirs only until the host injects a real backend. */
function createMockFs(): ReelFsAdapter {
  const dirs = new Set<string>(["/", "/reel-projects", "/reel-projects/session"]);
  const list = async (p: string): Promise<FsList> => {
    const path = norm(p);
    if (!dirs.has(path)) throw new Error(`not found: ${path}`);
    const prefix = path === "/" ? "/" : `${path}/`;
    const entries: FsEntry[] = [...dirs]
      .filter((d) => d !== "/" && d.startsWith(prefix) && !d.slice(prefix.length).includes("/"))
      .map((d) => ({ name: d.slice(prefix.length), kind: "dir" as const, size: 0 }));
    return {
      path,
      entries,
      roots: [{ label: "Projects", path: "/reel-projects" }],
      parent: path === "/" ? null : path.slice(0, path.lastIndexOf("/")) || "/",
    };
  };
  return {
    list,
    mkdir: async (p: string) => {
      const path = norm(p);
      const parts = path.split("/").filter(Boolean);
      let cur = "";
      for (const part of parts) dirs.add((cur = `${cur}/${part}`));
    },
    rawUrl: (p: string) => p,
  };
}

let fsAdapter: ReelFsAdapter = createMockFs();

/** Host wiring: swap the mock for a real backend (VPS api, Convex, S3…). */
export function configureReelFs(adapter: ReelFsAdapter): void {
  fsAdapter = adapter;
}

export function rawUrl(path: string): string {
  return fsAdapter.rawUrl(path);
}

// Stable identity — components keep `api` in effect deps, so a fresh object
// per render would refetch in a loop. Delegates live to the current adapter.
const api = { fs: { list: (p: string) => fsAdapter.list(p), mkdir: (p: string) => fsAdapter.mkdir(p) } };

export function useOsApi(): { fs: { list: ReelFsAdapter["list"]; mkdir: ReelFsAdapter["mkdir"] } } {
  return api;
}

// ── Responsive (standalone matchMedia; no shell provider required) ─────────
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

// ── Container-width bucket (standalone ResizeObserver; appshell-compatible) ─
// For the cases where a pane must reflow off its OWN width (not the viewport)
// and pure-CSS Tailwind `@container` variants aren't enough (JS branching).
export type Pane = "xs" | "sm" | "md" | "lg";

function bucket(w: number): Pane {
  if (w < 360) return "xs";
  if (w < 600) return "sm";
  if (w < 900) return "md";
  return "lg";
}

/** Observe an element's width → size bucket: `const [ref, pane] = useContainer()`. */
export function useContainer<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T | null>,
  Pane,
] {
  const ref = React.useRef<T>(null);
  const [pane, setPane] = React.useState<Pane>("lg");

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? el.clientWidth;
      setPane(bucket(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, pane];
}

// Hidden-input file picker primitive (audit:templates forbids raw
// native file inputs in slice source — the picker owns it outside the slice).
export { FilePicker } from "@/shared/ui/FilePicker";
export type { FilePickerHandle } from "@/shared/ui/FilePicker";
