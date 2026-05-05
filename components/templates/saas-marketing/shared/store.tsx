"use client";

import { createTemplateStore } from "@/components/templates/_shared/hooks/create-template-store";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return SEED_STATE;
    default:
      return state;
  }
}

const { Provider, useStore } = createTemplateStore<State, Action>({
  storageKey: "saas-marketing:state:v1",
  channel: "saas-marketing:sync",
  seed: SEED_STATE,
  reducer,
});

export const StoreProvider = Provider;
export { useStore };

export const usePricing = () => useStore().state.pricing;
export const useFeatures = () => useStore().state.features;
export const usePosts = () => useStore().state.posts;
export const usePost = (slug: string) =>
  usePosts().find((p) => p.slug === slug) ?? null;
export const useChangelog = () => useStore().state.changelog;

export { fmtDate, rel } from "@/components/templates/_shared/utils";
