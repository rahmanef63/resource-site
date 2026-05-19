"use client";

import * as React from "react";
import { createTemplateStore } from "@/components/templates/_shared/hooks/create-template-store";
import { pagesReducer } from "@/components/templates/_shared/pages/reducer";
import {
  PagesProvider,
  type PagesStore,
} from "@/components/templates/_shared/pages/pages-context";
import type { PageEntry } from "@/components/templates/_shared/pages/types";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return SEED_STATE;
    case "PAGE_CREATE":
    case "PAGE_UPDATE":
    case "PAGE_DELETE":
    case "PAGE_REORDER_BLOCK": {
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

    case "LANDING_UPSERT": {
      const idx = state.landingSections.findIndex((s) => s.id === action.payload.id);
      const landingSections =
        idx >= 0
          ? state.landingSections.map((s) => (s.id === action.payload.id ? action.payload : s))
          : [...state.landingSections, action.payload];
      return { ...state, landingSections };
    }
    case "LANDING_DELETE":
      return {
        ...state,
        landingSections: state.landingSections.filter((s) => s.id !== action.payload.id),
      };

    default:
      return state;
  }
}

const { Provider, useStore } = createTemplateStore<State, Action>({
  storageKey: "saas-marketing:state:v2-pages",
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
    }),
    [state.pages, dispatch],
  );
  return <PagesProvider value={value}>{children}</PagesProvider>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <PagesAdapter>{children}</PagesAdapter>
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
