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
    case "POST_CREATE":
      return { ...state, posts: [action.payload, ...state.posts] };
    case "POST_UPDATE":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.patch } : p,
        ),
      };
    case "POST_DELETE":
      return { ...state, posts: state.posts.filter((p) => p.id !== action.payload.id) };
    case "CUSTOMER_UPSERT": {
      const idx = state.customers.findIndex((c) => c.id === action.payload.id);
      const customers =
        idx >= 0
          ? state.customers.map((c) => (c.id === action.payload.id ? action.payload : c))
          : [action.payload, ...state.customers];
      return { ...state, customers };
    }
    case "CUSTOMER_DELETE":
      return { ...state, customers: state.customers.filter((c) => c.id !== action.payload.id) };
    case "SUBSCRIPTION_UPSERT": {
      const idx = state.subscriptions.findIndex((s) => s.id === action.payload.id);
      const subscriptions =
        idx >= 0
          ? state.subscriptions.map((s) => (s.id === action.payload.id ? action.payload : s))
          : [action.payload, ...state.subscriptions];
      return { ...state, subscriptions };
    }
    case "SUBSCRIPTION_DELETE":
      return {
        ...state,
        subscriptions: state.subscriptions.filter((s) => s.id !== action.payload.id),
      };
    case "LEAD_UPSERT": {
      const idx = state.leads.findIndex((l) => l.id === action.payload.id);
      const leads =
        idx >= 0
          ? state.leads.map((l) => (l.id === action.payload.id ? action.payload : l))
          : [action.payload, ...state.leads];
      return { ...state, leads };
    }
    case "LEAD_DELETE":
      return { ...state, leads: state.leads.filter((l) => l.id !== action.payload.id) };
    case "CHANGELOG_UPSERT": {
      const idx = state.changelog.findIndex((e) => e.id === action.payload.id);
      const changelog =
        idx >= 0
          ? state.changelog.map((e) => (e.id === action.payload.id ? action.payload : e))
          : [action.payload, ...state.changelog];
      return { ...state, changelog, changelogEntries: changelog };
    }
    case "CHANGELOG_DELETE": {
      const changelog = state.changelog.filter((e) => e.id !== action.payload.id);
      return { ...state, changelog, changelogEntries: changelog };
    }
    case "PRICING_UPSERT": {
      const idx = state.pricing.findIndex((t) => t.id === action.payload.id);
      const pricing =
        idx >= 0
          ? state.pricing.map((t) => (t.id === action.payload.id ? action.payload : t))
          : [...state.pricing, action.payload];
      return { ...state, pricing };
    }
    case "PRICING_DELETE":
      return { ...state, pricing: state.pricing.filter((t) => t.id !== action.payload.id) };
    case "FEATURE_UPSERT": {
      const idx = state.features.findIndex((f) => f.id === action.payload.id);
      const features =
        idx >= 0
          ? state.features.map((f) => (f.id === action.payload.id ? action.payload : f))
          : [...state.features, action.payload];
      return { ...state, features };
    }
    case "FEATURE_DELETE":
      return { ...state, features: state.features.filter((f) => f.id !== action.payload.id) };
    case "LANDING_UPSERT":
    case "LANDING_DELETE": {
      const next = landingReducer({ landingSections: state.landingSections }, action);
      return { ...state, landingSections: next.landingSections };
    }

    default:
      return state;
  }
}

const { Provider, useStore } = createTemplateStore<State, Action>({
  // v3-landing: AB-wave added LandingSection. Hydrate merge defends old payloads.
  storageKey: "saas-marketing:state:v3-landing",
  channel: "saas-marketing:sync",
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

export const usePricing = () => useStore().state.pricing;
export const useFeatures = () => useStore().state.features;
export const usePosts = () => useStore().state.posts;
export const usePost = (slug: string) =>
  usePosts().find((p) => p.slug === slug) ?? null;
export const useChangelog = () => useStore().state.changelog;
export const usePages = () => useStore().state.pages;
export const useLandingSections = () => useStore().state.landingSections;

export { fmtDate, rel } from "@/components/templates/_shared/utils";
