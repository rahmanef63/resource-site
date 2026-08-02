"use client";

// Single integration seam for the resources-launcher-admin slice. In the rr
// catalog the slice is SELF-CONTAINED: the CRUD runs against an in-memory mock
// store so add / edit / remove / reorder are all live with zero backend.
// Lifting into a real app: call configureResources({ mode:"live", list, upsert,
// remove, canManage }) pointing at your store (Convex, REST, …) — every other
// file imports ONLY this seam.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

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

// ── Resource model (a curated launcher link) ───────────────────────────────
export type Resource = {
  id: string;
  label: string;
  /** lucide icon NAME — resolved to a component client-side (see lib/icons). */
  icon: string;
  url: string;
  group: string;
  order: number;
};
/** upsert payload — omit `id` to insert, pass `id` to patch. */
export type ResourceInput = Omit<Resource, "id"> & { id?: string };

export type ResourcesAdapter = {
  mode: "mock" | "live";
  /** Read the curated links (open read — guests see the launcher too). */
  list: () => Promise<Resource[]>;
  /** Owner write — insert (no id) or patch (with id). Omit for read-only. */
  upsert?: (r: ResourceInput) => Promise<void>;
  /** Owner delete. Omit for read-only. */
  remove?: (id: string) => Promise<void>;
  /** Is the current viewer allowed to manage the links? */
  canManage?: () => Promise<boolean>;
};

// In-browser mock so the CRUD UI is fully interactive with zero backend.
function createMockResources(): ResourcesAdapter {
  const rows: Resource[] = [
    { id: "seed-docs", label: "Docs", icon: "FileText", url: "https://example.com/docs", group: "Resources", order: 0 },
    { id: "seed-site", label: "Website", icon: "Globe", url: "https://example.com", group: "Resources", order: 1 },
    { id: "seed-contact", label: "Contact", icon: "Mail", url: "mailto:hello@example.com", group: "Links", order: 2 },
  ];
  let n = 0;
  return {
    mode: "mock",
    list: async () => rows.slice(),
    upsert: async (r) => {
      if (r.id) {
        const i = rows.findIndex((x) => x.id === r.id);
        if (i >= 0) {
          rows[i] = { ...rows[i], ...r, id: r.id };
          return;
        }
      }
      rows.push({ ...r, id: `local-${++n}` });
    },
    remove: async (id) => {
      const i = rows.findIndex((x) => x.id === id);
      if (i >= 0) rows.splice(i, 1);
    },
    canManage: async () => true,
  };
}

let adapter: ResourcesAdapter = createMockResources();

/** Host wiring: swap the mock for a real backend (Convex, REST, …). */
export function configureResources(a: ResourcesAdapter): void {
  adapter = a;
}

// Stable identity — components keep `api` in effect deps, so a fresh object per
// render would re-run effects. Delegates live to the current adapter.
const api = {
  get mode() {
    return adapter.mode;
  },
  get canWrite() {
    return !!adapter.upsert && !!adapter.remove;
  },
  list: () => adapter.list(),
  upsert: (r: ResourceInput) => (adapter.upsert ? adapter.upsert(r) : Promise.resolve()),
  remove: (id: string) => (adapter.remove ? adapter.remove(id) : Promise.resolve()),
  canManage: () => (adapter.canManage ? adapter.canManage() : Promise.resolve(false)),
};

export function useResourcesApi(): typeof api {
  return api;
}
