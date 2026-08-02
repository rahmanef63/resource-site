"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: the shell inspector bus is a
// no-op, "Open in editor" handoffs go through an injectable opener, and
// remote file paths resolve through an injectable source adapter (identity
// by default — pass full/public URLs and they just work).
// Lifting into a shell (e.g. the `appshell` slice): replace these exports
// with the shell's own `openWindow` / `usePublishInspector` / fs `rawUrl` —
// every other file in the slice imports ONLY this seam.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

// ── App props (appshell-compatible; the viewer only reads `payload`) ───────
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
  noDock?: boolean;
};

// ── Editor handoff (the "Open in Image/Video Editor" actions) ──────────────
export type MediaOpener = (
  appId: string,
  title?: string,
  size?: { w: number; h: number },
  payload?: unknown,
) => void;

let opener: MediaOpener = () => {};

/** Host wiring: route handoffs to your shell/editor (no-op until set). */
export function configureMediaOpener(fn: MediaOpener): void {
  opener = fn;
}

export function openWindow(
  appId: string,
  title?: string,
  size?: { w: number; h: number },
  payload?: unknown,
): void {
  opener(appId, title, size, payload);
}

// ── Remote media source (resolve a file path to a fetchable URL) ───────────
export type MediaSource = { rawUrl: (path: string) => string };

let source: MediaSource = { rawUrl: (p) => p };

/** Host wiring: map fs paths to your media endpoint (identity by default). */
export function configureMediaSource(s: MediaSource): void {
  source = s;
}

export function rawUrl(path: string): string {
  return source.rawUrl(path);
}
