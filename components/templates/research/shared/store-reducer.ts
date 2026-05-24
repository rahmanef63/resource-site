// Riset Kit reducer — extracted from store.tsx to keep that file under 200 LOC.
// Pure function over (State, Action) — no React dependency.

import { pagesReducer } from "@/components/templates/_shared/pages/reducer";
import { landingReducer } from "@/components/templates/_shared/landing/reducer";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      // Shallow-merge SEED_STATE so any field added in a newer schema
      // gets its default when hydrating older localStorage payloads.
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

    case "project.upsert": {
      const idx = state.projects.findIndex((p) => p.id === action.project.id);
      const projects =
        idx >= 0
          ? state.projects.map((p) => (p.id === action.project.id ? action.project : p))
          : [action.project, ...state.projects];
      return { ...state, projects };
    }
    case "project.delete":
      return { ...state, projects: state.projects.filter((p) => p.id !== action.id) };

    case "dataset.upsert": {
      const idx = state.datasets.findIndex((d) => d.id === action.dataset.id);
      const datasets =
        idx >= 0
          ? state.datasets.map((d) => (d.id === action.dataset.id ? action.dataset : d))
          : [action.dataset, ...state.datasets];
      return { ...state, datasets };
    }
    case "dataset.delete":
      return { ...state, datasets: state.datasets.filter((d) => d.id !== action.id) };

    case "collaborator.upsert": {
      const idx = state.collaborators.findIndex((c) => c.id === action.collaborator.id);
      const collaborators =
        idx >= 0
          ? state.collaborators.map((c) => (c.id === action.collaborator.id ? action.collaborator : c))
          : [action.collaborator, ...state.collaborators];
      return { ...state, collaborators };
    }
    case "collaborator.delete":
      return { ...state, collaborators: state.collaborators.filter((c) => c.id !== action.id) };

    default:
      return state;
  }
}
