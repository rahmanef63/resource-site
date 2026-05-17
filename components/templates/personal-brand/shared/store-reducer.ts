// Personal Brand OS state reducer. Split out of `store.tsx` (LOC cap).
// Pure function over (State, Action) — no React dependency.

import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return SEED_STATE;

    case "post.upsert": {
      const idx = state.posts.findIndex((p) => p.id === action.post.id);
      const posts =
        idx >= 0
          ? state.posts.map((p) => (p.id === action.post.id ? action.post : p))
          : [action.post, ...state.posts];
      return { ...state, posts };
    }
    case "post.delete":
      return { ...state, posts: state.posts.filter((p) => p.id !== action.id) };
    case "post.view":
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.id ? { ...p, views: p.views + 1 } : p)),
      };

    case "portfolio.upsert": {
      const idx = state.portfolio.findIndex((p) => p.id === action.item.id);
      const portfolio =
        idx >= 0
          ? state.portfolio.map((p) => (p.id === action.item.id ? action.item : p))
          : [action.item, ...state.portfolio];
      return { ...state, portfolio };
    }
    case "portfolio.delete":
      return { ...state, portfolio: state.portfolio.filter((p) => p.id !== action.id) };

    case "service.upsert": {
      const idx = state.services.findIndex((s) => s.id === action.svc.id);
      const services =
        idx >= 0
          ? state.services.map((s) => (s.id === action.svc.id ? action.svc : s))
          : [...state.services, action.svc];
      return { ...state, services };
    }
    case "service.delete":
      return { ...state, services: state.services.filter((s) => s.id !== action.id) };

    case "resource.upsert": {
      const idx = state.resources.findIndex((r) => r.id === action.res.id);
      const resources =
        idx >= 0
          ? state.resources.map((r) => (r.id === action.res.id ? action.res : r))
          : [...state.resources, action.res];
      return { ...state, resources };
    }
    case "resource.delete":
      return { ...state, resources: state.resources.filter((r) => r.id !== action.id) };
    case "resource.download":
      return {
        ...state,
        resources: state.resources.map((r) =>
          r.id === action.id ? { ...r, downloads: r.downloads + 1 } : r,
        ),
      };

    case "lead.create":
      return { ...state, leads: [action.lead, ...state.leads] };
    case "lead.update":
      return {
        ...state,
        leads: state.leads.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l)),
      };
    case "lead.delete":
      return { ...state, leads: state.leads.filter((l) => l.id !== action.id) };

    case "comment.create":
      return { ...state, comments: [action.comment, ...state.comments] };
    case "comment.moderate":
      return {
        ...state,
        comments: state.comments.map((c) =>
          c.id === action.id ? { ...c, status: action.status } : c,
        ),
      };

    case "subscriber.create":
      return { ...state, subscribers: [action.sub, ...state.subscribers] };
    case "subscriber.confirm":
      return {
        ...state,
        subscribers: state.subscribers.map((s) =>
          s.id === action.id ? { ...s, status: "confirmed" } : s,
        ),
      };
    case "subscriber.unsubscribe":
      return {
        ...state,
        subscribers: state.subscribers.map((s) =>
          s.id === action.id ? { ...s, status: "unsubscribed" } : s,
        ),
      };

    case "chat.session.start":
      return { ...state, chatSessions: [action.session, ...state.chatSessions] };
    case "chat.message":
      return {
        ...state,
        chatSessions: state.chatSessions.map((s) =>
          s.id === action.sessionId
            ? {
                ...s,
                messages: [...s.messages, action.msg],
                flagged: action.flag ? true : s.flagged,
              }
            : s,
        ),
      };

    default:
      return state;
  }
}
