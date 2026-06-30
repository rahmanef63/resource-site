"use client";

// Single integration seam for the html-studio slice. In the rr catalog the
// slice is SELF-CONTAINED: pages save to an in-memory mock store, so the
// editor + live sandboxed preview + saved list all work with ZERO backend.
// Lifting into a real app: call configureHtmlStudio({ mode:"live", save, load,
// list, remove }) pointing at your store (Convex, a REST endpoint, …) — every
// other file in the slice imports ONLY this seam.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { STARTER } from "./util";

// ── Shell inspector bus — inert outside a shell ────────────────────────────
export type InspectorInfo = {
  subject?: string;
  props?: { label: string; value: string }[];
  actions?: { id: string; label: string; run: () => void }[];
  context?: string;
  suggestions?: string[];
};
export function usePublishInspector(_appId: string, _info: InspectorInfo, _deps: unknown[]): void {}

// ── App descriptor + props (appshell-compatible subset the barrel uses) ─────
export type AppProps = { payload?: unknown };
export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType<AppProps> }>;
  defaultSize?: { w: number; h: number };
};

// ── HTML Studio adapter (save / load / list / remove a page) ───────────────
export type Visibility = "public" | "private";
export type HtmlDoc = { title: string; html: string; visibility: Visibility };
export type SavedPage = HtmlDoc & { slug: string; updatedAt: number };
export type PageRow = { slug: string; title: string; visibility: Visibility; updatedAt: number };

export type HtmlStudioAdapter = {
  mode: "mock" | "live";
  /** Persist a page (new slug when omitted); returns its slug. Omit to make
   *  the studio a read-only sandbox (Save hidden). */
  save?: (doc: HtmlDoc & { slug?: string }) => Promise<{ slug: string }>;
  /** Read one saved page by slug (null when missing / not visible). */
  load?: (slug: string) => Promise<SavedPage | null>;
  /** List saved pages for the saved-list rail. Omit to hide the rail. */
  list?: () => Promise<PageRow[]>;
  /** Delete a saved page. */
  remove?: (slug: string) => Promise<void>;
};

function slugify(title: string, n: number): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
  return `${base || "page"}-${n.toString(36)}`;
}

// In-browser mock so the slice is alive (editor + preview + saved list) with
// zero backend. Seeded with one page so the saved-list + open flow render.
function createMockStudio(): HtmlStudioAdapter {
  const pages = new Map<string, SavedPage>([
    ["welcome-1", { slug: "welcome-1", title: "Welcome", html: STARTER, visibility: "public", updatedAt: Date.now() - 36e5 }],
  ]);
  let n = 0;
  return {
    mode: "mock",
    save: async ({ slug, title, html, visibility }) => {
      const s = slug && pages.has(slug) ? slug : slugify(title, ++n);
      pages.set(s, { slug: s, title, html, visibility, updatedAt: Date.now() });
      return { slug: s };
    },
    load: async (slug) => pages.get(slug) ?? null,
    list: async () =>
      [...pages.values()]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(({ slug, title, visibility, updatedAt }) => ({ slug, title, visibility, updatedAt })),
    remove: async (slug) => {
      pages.delete(slug);
    },
  };
}

let adapter: HtmlStudioAdapter = createMockStudio();

/** Host wiring: swap the mock for a real backend (Convex, REST, blob store…). */
export function configureHtmlStudio(a: HtmlStudioAdapter): void {
  adapter = a;
}

// Stable identity — components keep `api` in effect deps, so a fresh object
// per render would re-run effects. Delegates live to the current adapter.
const api = {
  get mode() {
    return adapter.mode;
  },
  get canSave() {
    return !!adapter.save;
  },
  get hasList() {
    return !!adapter.list;
  },
  save: (doc: HtmlDoc & { slug?: string }) =>
    adapter.save ? adapter.save(doc) : Promise.resolve({ slug: "" }),
  load: (slug: string) => (adapter.load ? adapter.load(slug) : Promise.resolve(null as SavedPage | null)),
  list: () => (adapter.list ? adapter.list() : Promise.resolve([] as PageRow[])),
  remove: (slug: string) => (adapter.remove ? adapter.remove(slug) : Promise.resolve()),
};

export function useHtmlStudioApi(): typeof api {
  return api;
}
