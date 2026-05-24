// Konsultan OS state reducer. Split out of `store.tsx` (LOC cap).
// Pure function over (State, Action) — no React dependency.

import { pagesReducer } from "@/components/templates/_shared/pages/reducer";
import { landingReducer } from "@/components/templates/_shared/landing/reducer";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
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

    case "client.upsert": {
      const idx = state.clients.findIndex((c) => c.id === action.client.id);
      const clients =
        idx >= 0
          ? state.clients.map((c) => (c.id === action.client.id ? action.client : c))
          : [action.client, ...state.clients];
      return { ...state, clients };
    }
    case "client.delete":
      return { ...state, clients: state.clients.filter((c) => c.id !== action.id) };

    case "proposal.upsert": {
      const idx = state.proposals.findIndex((p) => p.id === action.proposal.id);
      const proposals =
        idx >= 0
          ? state.proposals.map((p) => (p.id === action.proposal.id ? action.proposal : p))
          : [action.proposal, ...state.proposals];
      return { ...state, proposals };
    }
    case "proposal.delete":
      return { ...state, proposals: state.proposals.filter((p) => p.id !== action.id) };

    case "contract.upsert": {
      const idx = state.contracts.findIndex((c) => c.id === action.contract.id);
      const contracts =
        idx >= 0
          ? state.contracts.map((c) => (c.id === action.contract.id ? action.contract : c))
          : [action.contract, ...state.contracts];
      return { ...state, contracts };
    }
    case "contract.delete":
      return { ...state, contracts: state.contracts.filter((c) => c.id !== action.id) };

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

    case "invoice.upsert": {
      const idx = state.invoices.findIndex((i) => i.id === action.invoice.id);
      const invoices =
        idx >= 0
          ? state.invoices.map((i) => (i.id === action.invoice.id ? action.invoice : i))
          : [action.invoice, ...state.invoices];
      return { ...state, invoices };
    }
    case "invoice.delete":
      return { ...state, invoices: state.invoices.filter((i) => i.id !== action.id) };

    case "document.upsert": {
      const idx = state.documents.findIndex((d) => d.id === action.doc.id);
      const documents =
        idx >= 0
          ? state.documents.map((d) => (d.id === action.doc.id ? action.doc : d))
          : [action.doc, ...state.documents];
      return { ...state, documents };
    }
    case "document.delete":
      return { ...state, documents: state.documents.filter((d) => d.id !== action.id) };

    case "calendar.upsert": {
      const idx = state.calendarEvents.findIndex((e) => e.id === action.event.id);
      const calendarEvents =
        idx >= 0
          ? state.calendarEvents.map((e) => (e.id === action.event.id ? action.event : e))
          : [action.event, ...state.calendarEvents];
      return { ...state, calendarEvents };
    }
    case "calendar.delete":
      return { ...state, calendarEvents: state.calendarEvents.filter((e) => e.id !== action.id) };

    case "kb.upsert": {
      const idx = state.kbArticles.findIndex((a) => a.id === action.article.id);
      const kbArticles =
        idx >= 0
          ? state.kbArticles.map((a) => (a.id === action.article.id ? action.article : a))
          : [action.article, ...state.kbArticles];
      return { ...state, kbArticles };
    }
    case "kb.delete":
      return { ...state, kbArticles: state.kbArticles.filter((a) => a.id !== action.id) };

    default:
      return state;
  }
}
