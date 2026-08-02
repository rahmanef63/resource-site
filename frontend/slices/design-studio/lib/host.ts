"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: the shell inspector bus is a
// no-op, new image layers pull from the bundled offline samples, and saving
// an exported doc falls back to a client-side download. Lifting into a shell
// (e.g. the `appshell` slice): call `configureMediaStudio()` with your fs
// writer / media library — every other file imports ONLY this seam.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { SAMPLE_IMAGES } from "./samples";

// ── App props (appshell-compatible; the studio only reads `payload`) ───────
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

// ── Studio host adapter ─────────────────────────────────────────────────────
/** Persist an exported document; resolve to a path/label shown to the user. */
export type StudioDocSaver = (
  text: string,
  fileName: string,
  mime: string,
) => Promise<string>;

export type MediaStudioHost = {
  /** Write exports to a real fs (os-vps: /api/v1/fs). Unset = download only. */
  saveDoc?: StudioDocSaver;
  /** Image URLs offered to new image layers (default: bundled SVG samples). */
  imageSources?: () => string[];
};

let host: MediaStudioHost = {};

/** Host wiring: inject fs persistence + a real media library (mock default). */
export function configureMediaStudio(h: MediaStudioHost): void {
  host = { ...host, ...h };
}

/** True once a host doc-saver has been wired. */
export function canSaveToHost(): boolean {
  return typeof host.saveDoc === "function";
}

/** Save via the host adapter; returns null when no saver is configured. */
export async function saveDocToHost(
  text: string,
  fileName: string,
  mime: string,
): Promise<string | null> {
  if (!host.saveDoc) return null;
  return host.saveDoc(text, fileName, mime);
}

let cursor = 0;

/** Round-robin image source for fresh image layers (offline by default). */
export function nextImageSource(): string {
  const pool = host.imageSources?.() ?? SAMPLE_IMAGES;
  if (!pool.length) return "";
  return pool[cursor++ % pool.length];
}
