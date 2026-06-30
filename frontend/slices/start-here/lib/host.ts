"use client";

// Single integration seam for the start-here slice. In the rr catalog the slice
// is SELF-CONTAINED: the app catalog, the open() callback, and the stage journey
// are all INJECTED, and an in-memory mock supplies a few generic apps plus three
// stages so the guided tour renders fully alive with zero host. Lifting into a
// real OS: call configureStartHere({ mode:"live", apps, open, stages }) pointing
// at your live app registry — every other file imports ONLY this seam. Drift-proof
// by design: read the catalog, never hardcode a list (origin: rahmanef-com web-OS).

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Home, Library, Settings, Sparkles, StickyNote, Store } from "lucide-react";

// ── Shell inspector bus — inert outside a shell ────────────────────────────
export type InspectorInfo = {
  subject?: string;
  props?: { label: string; value: string }[];
  actions?: { id: string; label: string; run: () => void }[];
  context?: string;
  suggestions?: string[];
};
export function usePublishInspector(_appId: string, _info: InspectorInfo, _deps: unknown[]): void {}

// ── App descriptor (appshell-compatible subset the barrel uses) ────────────
export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

// ── Start-here adapter (live app catalog + open callback + journey) ────────
export type StartHereApp = {
  id: string;
  title: string;
  icon: LucideIcon;
  description?: string;
};
export type StartHereStage = {
  title: string;
  blurb: string;
  appIds: string[];
};

export type StartHereAdapter = {
  mode: "mock" | "live";
  /** The live app catalog — read it, never hardcode, so the tour is drift-proof. */
  apps: StartHereApp[];
  /** Open the real app by id (the host launches the window / route). */
  open: (id: string) => void;
  /** The hand-authored journey. Apps not placed here fall into "Everything else". */
  stages?: StartHereStage[];
};

// In-browser mock so the slice is alive (the path + tiles render) with zero host.
function createMockStartHere(): StartHereAdapter {
  const apps: StartHereApp[] = [
    { id: "home", title: "Home", icon: Home, description: "Your desktop overview and recent activity." },
    { id: "library", title: "Library", icon: Library, description: "Browse curated files, docs, and resources." },
    { id: "assistant", title: "Assistant", icon: Sparkles, description: "Ask the built-in AI about the workspace." },
    { id: "settings", title: "Settings", icon: Settings, description: "Theme, appearance, and preferences." },
    { id: "store", title: "App Store", icon: Store, description: "Install or remove apps." },
    { id: "docs", title: "Docs", icon: BookOpen, description: "Guides and reference." },
    { id: "notes", title: "Notes", icon: StickyNote, description: "A quick scratchpad." },
  ];
  const stages: StartHereStage[] = [
    {
      title: "Get oriented",
      blurb: "This whole desktop is your workspace. Open Home for the overview, then browse the Library to see what is here.",
      appIds: ["home", "library"],
    },
    {
      title: "Try it live",
      blurb: "Talk to the built-in assistant right now — ask about the workspace, the apps, or how any of this is put together.",
      appIds: ["assistant"],
    },
    {
      title: "Make it yours",
      blurb: "Re-theme the machine, install or remove apps from the store, and read the Docs when you want the details.",
      appIds: ["settings", "store", "docs"],
    },
  ];
  return {
    mode: "mock",
    apps,
    open: (id) => {
      // No host in the catalog preview — log so the tile click is observable.
      if (typeof console !== "undefined") console.info(`[start-here] open app: ${id}`);
    },
    stages,
  };
}

let adapter: StartHereAdapter = createMockStartHere();

/** Host wiring: swap the mock for the live app registry + window opener. */
export function configureStartHere(a: StartHereAdapter): void {
  adapter = a;
}

// Stable identity — the component keeps `api` in memo deps, so a fresh object
// per render would re-run them. Delegates live to the current adapter.
const api = {
  get mode() {
    return adapter.mode;
  },
  get apps() {
    return adapter.apps;
  },
  get stages() {
    return adapter.stages ?? [];
  },
  open: (id: string) => adapter.open(id),
};

export function useStartHereApi(): typeof api {
  return api;
}
