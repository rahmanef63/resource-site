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
    case "PAGE_REORDER_BLOCK": {
      const next = pagesReducer({ pages: state.pages }, action);
      return { ...state, pages: next.pages };
    }

    case "LANDING_UPSERT":
    case "LANDING_DELETE": {
      const next = landingReducer({ landingSections: state.landingSections }, action);
      return { ...state, landingSections: next.landingSections };
    }

    case "doc.upsert": {
      const idx = state.documents.findIndex((d) => d.id === action.doc.id);
      const documents =
        idx >= 0
          ? state.documents.map((d) => (d.id === action.doc.id ? action.doc : d))
          : [action.doc, ...state.documents];
      return { ...state, documents };
    }
    case "doc.delete":
      return { ...state, documents: state.documents.filter((d) => d.id !== action.id) };

    case "note.upsert": {
      const idx = state.notes.findIndex((n) => n.id === action.note.id);
      const notes =
        idx >= 0
          ? state.notes.map((n) => (n.id === action.note.id ? action.note : n))
          : [action.note, ...state.notes];
      return { ...state, notes };
    }
    case "note.delete":
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };

    case "citation.upsert": {
      const idx = state.citations.findIndex((c) => c.id === action.citation.id);
      const citations =
        idx >= 0
          ? state.citations.map((c) => (c.id === action.citation.id ? action.citation : c))
          : [action.citation, ...state.citations];
      return { ...state, citations };
    }
    case "citation.delete":
      return { ...state, citations: state.citations.filter((c) => c.id !== action.id) };

    case "litreview.upsert": {
      const idx = state.litReviews.findIndex((l) => l.id === action.lit.id);
      const litReviews =
        idx >= 0
          ? state.litReviews.map((l) => (l.id === action.lit.id ? action.lit : l))
          : [action.lit, ...state.litReviews];
      return { ...state, litReviews };
    }
    case "litreview.delete":
      return { ...state, litReviews: state.litReviews.filter((l) => l.id !== action.id) };

    case "aireader.create":
      return { ...state, aiReaderSessions: [action.session, ...state.aiReaderSessions] };

    case "aireader.upsert": {
      const idx = state.aiReaderSessions.findIndex((s) => s.id === action.session.id);
      const aiReaderSessions =
        idx >= 0
          ? state.aiReaderSessions.map((s) => (s.id === action.session.id ? action.session : s))
          : [action.session, ...state.aiReaderSessions];
      return { ...state, aiReaderSessions };
    }
    case "aireader.delete":
      return { ...state, aiReaderSessions: state.aiReaderSessions.filter((s) => s.id !== action.id) };

    default:
      return state;
  }
}

const { Provider, useStore } = createTemplateStore<State, Action>({
  storageKey: "riset:state:v4-landing-sync",
  channel: "riset:sync",
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
export const useLandingSections = () => useStore().state.landingSections;

export function useDocuments() {
  const { state } = useStore();
  return state.documents;
}
export function useDocument(id: string) {
  const { state } = useStore();
  return state.documents.find((d) => d.id === id) ?? null;
}
export function useNotes() {
  const { state } = useStore();
  return state.notes;
}
export function useCitations() {
  const { state } = useStore();
  return state.citations;
}
export function useLitReviews() {
  const { state } = useStore();
  return state.litReviews;
}
export function useAiReaderSessions() {
  const { state } = useStore();
  return state.aiReaderSessions;
}

export { nid, slugify, fmtDate, rel } from "@/components/templates/_shared/utils";
