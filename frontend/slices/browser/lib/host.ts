"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: a canvas "demo renderer" fakes
// the remote viewport (per UI tab) so the whole chrome (tabs, omnibar,
// bookmarks, history, AI activity panel) works offline, and the shell
// inspector bus is a no-op. Wire a REAL headless browser (e.g. a Playwright
// service) with configureBrowser / configureScreencast / configureBrowserMode.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { createDemoBrowser } from "./demo-browser";

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

// ── Mode — live (mount the browser chrome) vs mock notice ──────────────────
// Default: live, flagged demo (the bundled canvas renderer drives the chrome
// offline). A host can swap this for its own mock/live setting so the chrome
// only polls a real backend when one is reachable.
export type BrowserMode = { live: boolean; demo: boolean };

let modeHook: () => BrowserMode = () => ({ live: true, demo: true });

/** Host wiring: decide when the live chrome mounts vs the mock notice. */
export function configureBrowserMode(hook: () => BrowserMode): void {
  modeHook = hook;
}

export function useBrowserMode(): BrowserMode {
  return modeHook();
}

// ── Remote browser adapter (multitab: every call carries a tab id) ─────────
export type RemoteState = { url: string; title: string };
export type AgentLogEntry = { ts?: string; action: string; actor?: string; target?: string };

/** Action paths the UI sends: navigate/click/type/key/scroll/back/forward/reload. */
export type BrowserAdapter = {
  state: (tab: string) => Promise<RemoteState>;
  screenshot: (tab: string) => Promise<Blob | null>;
  act: (path: string, body: unknown, tab: string) => Promise<Partial<RemoteState>>;
  close: (tab: string) => Promise<void>;
  agentLog: () => Promise<AgentLogEntry[]>;
  saveShot: (tab: string) => Promise<{ path?: string; error?: string }>;
};

const demo: BrowserAdapter = createDemoBrowser();
let adapter: BrowserAdapter = demo;

/** Host wiring: drive a real headless browser (Playwright service, CDP…).
 *  Optional methods (close/agentLog/saveShot) fall back to demo behaviour. */
export function configureBrowser(
  a: Pick<BrowserAdapter, "state" | "screenshot" | "act"> & Partial<BrowserAdapter>,
): void {
  adapter = { ...demo, ...a };
}

// Stable identity — hooks keep this in effect deps.
const api: BrowserAdapter = {
  state: (t) => adapter.state(t),
  screenshot: (t) => adapter.screenshot(t),
  act: (p, b, t) => adapter.act(p, b, t),
  close: (t) => adapter.close(t),
  agentLog: () => adapter.agentLog(),
  saveShot: (t) => adapter.saveShot(t),
};

export function useBrowserApi(): BrowserAdapter {
  return api;
}

// ── Live screencast stream (multipart-JPEG) ─────────────────────────────────
// Default: null — the demo adapter has no stream, so the view stays on the
// screenshot-poll fallback. A real host returns its MJPEG endpoint per tab.
let screencastUrlFn: (tab: string) => string | null = () => null;

/** Host wiring: the MJPEG screencast URL for a tab (null = poll only). */
export function configureScreencast(fn: (tab: string) => string | null): void {
  screencastUrlFn = fn;
}

export function streamUrl(tab: string): string | null {
  return screencastUrlFn(tab);
}
