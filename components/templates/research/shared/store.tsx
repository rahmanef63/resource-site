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

    default:
      return state;
  }
}

const { Provider, useStore } = createTemplateStore<State, Action>({
  storageKey: "riset:state:v1",
  channel: "riset:sync",
  seed: SEED_STATE,
  reducer,
});

export const StoreProvider = Provider;
export { useStore };

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
