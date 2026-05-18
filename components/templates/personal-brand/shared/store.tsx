"use client";

import * as React from "react";
import { createTemplateStore } from "@/components/templates/_shared/hooks/create-template-store";
import {
  PagesProvider,
  type PagesStore,
} from "@/components/templates/_shared/pages/pages-context";
import type { PageEntry } from "@/components/templates/_shared/pages/types";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";
import { reducer } from "./store-reducer";

const { Provider, useStore } = createTemplateStore<State, Action>({
  storageKey: "pbos:state:v2-pages",
  channel: "pbos:sync",
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

// Convenience derived selectors.

export function usePosts() {
  const { state } = useStore();
  return state.posts;
}
export function usePublishedPosts() {
  const { state } = useStore();
  return React.useMemo(
    () => state.posts.filter((p) => p.status === "published").sort((a, b) => b.publishedAt - a.publishedAt),
    [state.posts],
  );
}
export function usePost(slug: string) {
  const { state } = useStore();
  return state.posts.find((p) => p.slug === slug) ?? null;
}
export function usePortfolio() {
  const { state } = useStore();
  return state.portfolio;
}
export function usePortfolioItem(slug: string) {
  const { state } = useStore();
  return state.portfolio.find((p) => p.slug === slug) ?? null;
}
export function useServices() {
  const { state } = useStore();
  return state.services;
}
export function useResources() {
  const { state } = useStore();
  return state.resources;
}
export function useLeads() {
  const { state } = useStore();
  return state.leads;
}
export function useComments() {
  const { state } = useStore();
  return state.comments;
}
export function usePostComments(postId: string) {
  const { state } = useStore();
  return state.comments.filter((c) => c.postId === postId && c.status === "approved");
}
export function useSubscribers() {
  const { state } = useStore();
  return state.subscribers;
}
export function useChatSessions() {
  const { state } = useStore();
  return state.chatSessions;
}
export const usePages = () => useStore().state.pages;

// Re-export shared utils so existing T1 imports keep working.
export { nid, slugify, fmtDate, rel } from "@/components/templates/_shared/utils";

// Naive AI moderation flag — used by comment form (T1-specific business logic).
export function aiFlag(body: string): "spam" | "toxic" | null {
  const lower = body.toLowerCase();
  if (/(buy|cheap|http|https|crypto|loan|viagra|followers)/.test(lower)) return "spam";
  if (/(idiot|stupid|hate you|moron)/.test(lower)) return "toxic";
  return null;
}
