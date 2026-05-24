"use client";

import * as React from "react";
import { createTemplateStore } from "@/components/templates/_shared/hooks/create-template-store";
import { pagesReducer } from "@/components/templates/_shared/pages/reducer";
import {
  PagesProvider,
  type PagesStore,
} from "@/components/templates/_shared/pages/pages-context";
import type { PageEntry } from "@/components/templates/_shared/pages/types";
import { landingReducer } from "@/components/templates/_shared/landing/reducer";
import {
  LandingProvider,
  type LandingStore,
} from "@/components/templates/_shared/landing/landing-context";
import type { LandingSection } from "@/components/templates/_shared/landing/types";
import { ADMIN_BASE, PUBLIC_BASE } from "./nav-config";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      // Shallow-merge with SEED_STATE so any field added in a newer
      // schema (e.g. AB-wave landingSections) gets its default when
      // hydrating from an older localStorage payload.
      return { ...SEED_STATE, ...action.state };
    case "reset":
      return SEED_STATE;
    case "PAGE_CREATE":
    case "PAGE_UPDATE":
    case "PAGE_DELETE":
    case "PAGE_REORDER_BLOCK":
    case "PAGE_SECTION_UPSERT":
    case "PAGE_SECTION_DELETE": {
      const next = pagesReducer({ pages: state.pages }, action);
      return { ...state, pages: next.pages };
    }
    case "LANDING_UPSERT":
    case "LANDING_DELETE": {
      const next = landingReducer({ landingSections: state.landingSections }, action);
      return { ...state, landingSections: next.landingSections };
    }
    case "content.upsert": {
      const idx = state.contents.findIndex((c) => c.id === action.item.id);
      const contents =
        idx >= 0
          ? state.contents.map((c) => (c.id === action.item.id ? action.item : c))
          : [action.item, ...state.contents];
      return { ...state, contents };
    }
    case "content.delete":
      return { ...state, contents: state.contents.filter((c) => c.id !== action.id) };
    case "voice.upsert": {
      const idx = state.voices.findIndex((v) => v.id === action.voice.id);
      const voices =
        idx >= 0 ? state.voices.map((v) => (v.id === action.voice.id ? action.voice : v)) : [action.voice, ...state.voices];
      return { ...state, voices };
    }
    case "voice.delete":
      return { ...state, voices: state.voices.filter((v) => v.id !== action.id) };
    case "script.upsert": {
      const idx = state.scripts.findIndex((s) => s.id === action.script.id);
      const scripts =
        idx >= 0
          ? state.scripts.map((s) => (s.id === action.script.id ? action.script : s))
          : [action.script, ...state.scripts];
      return { ...state, scripts };
    }
    case "script.delete":
      return { ...state, scripts: state.scripts.filter((s) => s.id !== action.id) };
    case "carousel.upsert": {
      const idx = state.carousels.findIndex((c) => c.id === action.carousel.id);
      const carousels =
        idx >= 0
          ? state.carousels.map((c) => (c.id === action.carousel.id ? action.carousel : c))
          : [action.carousel, ...state.carousels];
      return { ...state, carousels };
    }
    case "carousel.delete":
      return { ...state, carousels: state.carousels.filter((c) => c.id !== action.id) };
    case "asset.upsert": {
      const idx = state.assets.findIndex((a) => a.id === action.asset.id);
      const assets =
        idx >= 0 ? state.assets.map((a) => (a.id === action.asset.id ? action.asset : a)) : [action.asset, ...state.assets];
      return { ...state, assets };
    }
    case "asset.delete":
      return { ...state, assets: state.assets.filter((a) => a.id !== action.id) };
    case "newsletter.upsert": {
      const idx = state.newsletters.findIndex((n) => n.id === action.issue.id);
      const newsletters =
        idx >= 0
          ? state.newsletters.map((n) => (n.id === action.issue.id ? action.issue : n))
          : [action.issue, ...state.newsletters];
      return { ...state, newsletters };
    }
    case "newsletter.delete":
      return { ...state, newsletters: state.newsletters.filter((n) => n.id !== action.id) };
    case "performance.upsert": {
      const idx = state.performance.findIndex((p) => p.id === action.metric.id);
      const performance =
        idx >= 0
          ? state.performance.map((p) => (p.id === action.metric.id ? action.metric : p))
          : [action.metric, ...state.performance];
      return { ...state, performance };
    }
    case "performance.delete":
      return { ...state, performance: state.performance.filter((p) => p.id !== action.id) };
    case "comment.upsert": {
      const idx = state.commentDrafts.findIndex((c) => c.id === action.draft.id);
      const commentDrafts =
        idx >= 0
          ? state.commentDrafts.map((c) => (c.id === action.draft.id ? action.draft : c))
          : [action.draft, ...state.commentDrafts];
      return { ...state, commentDrafts };
    }
    case "comment.delete":
      return { ...state, commentDrafts: state.commentDrafts.filter((c) => c.id !== action.id) };

    default:
      return state;
  }
}

const { Provider, useStore } = createTemplateStore<State, Action>({
  storageKey: "kreator:state:v4-landing-sync",
  channel: "kreator:sync",
  seed: SEED_STATE,
  reducer,
});

function PagesAdapter({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useStore();
  const value = React.useMemo<PagesStore>(
    () => ({
      pages: state.pages,
      create: (entry: PageEntry) => dispatch({ type: "PAGE_CREATE", payload: entry }),
      update: (id, patch) => dispatch({ type: "PAGE_UPDATE", payload: { id, patch } }),
      remove: (id: string) => dispatch({ type: "PAGE_DELETE", payload: { id } }),
      reorderBlock: (id, from, to) =>
        dispatch({ type: "PAGE_REORDER_BLOCK", payload: { id, from, to } }),
      upsertSection: (pageId, section) => dispatch({ type: "PAGE_SECTION_UPSERT", payload: { pageId, section } }),
      removeSection: (pageId, sectionId) => dispatch({ type: "PAGE_SECTION_DELETE", payload: { pageId, sectionId } }),
    }),
    [state.pages, dispatch],
  );
  return <PagesProvider value={value}>{children}</PagesProvider>;
}

function LandingAdapter({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useStore();
  const value = React.useMemo<LandingStore>(
    () => ({
      items: state.landingSections,
      publicBase: PUBLIC_BASE,
      adminBase: ADMIN_BASE,
      create: (section: LandingSection) =>
        dispatch({ type: "LANDING_UPSERT", payload: section }),
      update: (id, patch) => {
        const current = state.landingSections.find((s) => s.id === id);
        if (!current) return;
        dispatch({ type: "LANDING_UPSERT", payload: { ...current, ...patch, id } });
      },
      remove: (id: string) => dispatch({ type: "LANDING_DELETE", payload: { id } }),
    }),
    [state.landingSections, dispatch],
  );
  return <LandingProvider value={value}>{children}</LandingProvider>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <PagesAdapter>
        <LandingAdapter>{children}</LandingAdapter>
      </PagesAdapter>
    </Provider>
  );
}
export { useStore };
export const usePages = () => useStore().state.pages;
export const useContents = () => useStore().state.contents;
export const useVoices = () => useStore().state.voices;
export const useScripts = () => useStore().state.scripts;
export const useCarousels = () => useStore().state.carousels;
export const useAssets = () => useStore().state.assets;
export const useNewsletters = () => useStore().state.newsletters;
export const usePerformance = () => useStore().state.performance;
export const useCommentDrafts = () => useStore().state.commentDrafts;
export const useLandingSections = () => useStore().state.landingSections;
export const usePackages = () => useStore().state.packages;
export const useShowcase = () => useStore().state.showcase;
export const useJournal = () => useStore().state.journal;
export const useTestimonials = () => useStore().state.testimonials;
export const useFeaturedClients = () => useStore().state.featuredClients;
export const useMonetization = () => { const s = useStore().state; return { sources: s.monetizationSources, months: s.monetizationMonths, payouts: s.payouts }; };

export { nid, slugify, fmtDate, rel } from "@/components/templates/_shared/utils";
