"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: the shell inspector bus is a
// no-op and the filesystem runs on an injectable adapter (a writable
// in-memory mock seeded from lib/seed.ts by default).
// Lifting into a shell (e.g. the `appshell` slice): replace these exports
// with the shell's own `usePublishInspector` / fs api — every other file
// in the slice imports ONLY this seam.

import * as React from "react";
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { createMockFs } from "./mock-fs";

// ── App props (appshell-compatible; the editor only reads `payload`) ───────
export type AppProps = { payload?: unknown; winId?: string };

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

// ── Filesystem adapter (explorer tree + open/save) ─────────────────────────
export type FsEntry = { name: string; kind: "dir" | "file"; size?: number };
export type FsList = { path: string; entries: FsEntry[] };

export type CodeFsAdapter = {
  /** List ONE directory. Return the canonical resolved path in `path`. */
  list: (path: string) => Promise<FsList>;
  read: (path: string) => Promise<string>;
  write: (path: string, content: string) => Promise<unknown>;
  mkdir: (path: string) => Promise<unknown>;
};

let fsAdapter: CodeFsAdapter = createMockFs();

/** Host wiring: swap the mock for a real backend (VPS api, Convex, S3…). */
export function configureCodeFs(adapter: CodeFsAdapter): void {
  fsAdapter = adapter;
}

export function useOsApi(): { fs: CodeFsAdapter } {
  return {
    fs: {
      list: (p) => fsAdapter.list(p),
      read: (p) => fsAdapter.read(p),
      write: (p, c) => fsAdapter.write(p, c),
      mkdir: (p) => fsAdapter.mkdir(p),
    },
  };
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
