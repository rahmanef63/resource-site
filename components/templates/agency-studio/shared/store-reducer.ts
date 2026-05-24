// Agency Studio OS state reducer. Split out of `store.tsx` (LOC cap).
// Pure function over (State, Action) — no React dependency.

import { pagesReducer } from "@/components/templates/_shared/pages/reducer";
import { landingReducer } from "@/components/templates/_shared/landing/reducer";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";
import { DEFAULT_AI_CONFIG } from "./ai-config-seed";

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

    case "project.upsert": {
      const idx = state.projects.findIndex((p) => p.id === action.project.id);
      const projects = idx >= 0
        ? state.projects.map((p) => (p.id === action.project.id ? action.project : p))
        : [action.project, ...state.projects];
      return { ...state, projects };
    }
    case "project.delete":
      return { ...state, projects: state.projects.filter((p) => p.id !== action.id) };

    case "client.upsert": {
      const idx = state.clients.findIndex((c) => c.id === action.client.id);
      const clients = idx >= 0
        ? state.clients.map((c) => (c.id === action.client.id ? action.client : c))
        : [action.client, ...state.clients];
      return { ...state, clients };
    }
    case "client.delete":
      return { ...state, clients: state.clients.filter((c) => c.id !== action.id) };

    case "service.upsert": {
      const idx = state.services.findIndex((s) => s.id === action.service.id);
      const services = idx >= 0
        ? state.services.map((s) => (s.id === action.service.id ? action.service : s))
        : [...state.services, action.service];
      return { ...state, services };
    }
    case "service.delete":
      return { ...state, services: state.services.filter((s) => s.id !== action.id) };

    case "lead.create":
      return { ...state, leads: [action.lead, ...state.leads] };
    case "lead.update":
      return {
        ...state,
        leads: state.leads.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l)),
      };
    case "lead.delete":
      return { ...state, leads: state.leads.filter((l) => l.id !== action.id) };

    case "article.upsert": {
      const idx = state.articles.findIndex((a) => a.id === action.article.id);
      const articles = idx >= 0
        ? state.articles.map((a) => (a.id === action.article.id ? action.article : a))
        : [action.article, ...state.articles];
      return { ...state, articles };
    }
    case "article.delete":
      return { ...state, articles: state.articles.filter((a) => a.id !== action.id) };

    case "comment.upsert": {
      const idx = state.comments.findIndex((c) => c.id === action.comment.id);
      const comments = idx >= 0
        ? state.comments.map((c) => (c.id === action.comment.id ? action.comment : c))
        : [action.comment, ...state.comments];
      return { ...state, comments };
    }
    case "comment.moderate":
      return {
        ...state,
        comments: state.comments.map((c) =>
          c.id === action.id ? { ...c, status: action.status } : c,
        ),
      };
    case "comment.delete":
      return { ...state, comments: state.comments.filter((c) => c.id !== action.id) };

    case "subscriber.upsert": {
      const idx = state.subscribers.findIndex((s) => s.id === action.sub.id);
      const subscribers = idx >= 0
        ? state.subscribers.map((s) => (s.id === action.sub.id ? action.sub : s))
        : [action.sub, ...state.subscribers];
      return { ...state, subscribers };
    }
    case "subscriber.delete":
      return { ...state, subscribers: state.subscribers.filter((s) => s.id !== action.id) };

    case "newsletter.upsert": {
      const idx = state.newsletters.findIndex((n) => n.id === action.draft.id);
      const newsletters = idx >= 0
        ? state.newsletters.map((n) => (n.id === action.draft.id ? action.draft : n))
        : [action.draft, ...state.newsletters];
      return { ...state, newsletters };
    }
    case "newsletter.delete":
      return { ...state, newsletters: state.newsletters.filter((n) => n.id !== action.id) };
    case "newsletter.send": {
      const recipients = state.subscribers.filter((s) => s.status === "confirmed").length;
      return {
        ...state,
        newsletters: state.newsletters.map((n) =>
          n.id === action.id ? { ...n, status: "sent", sentAt: Date.now(), recipients } : n,
        ),
      };
    }

    case "ai-config.update":
      return { ...state, aiConfig: { ...state.aiConfig, ...action.patch } };
    case "ai-config.reset":
      return { ...state, aiConfig: DEFAULT_AI_CONFIG };

    default:
      return state;
  }
}
