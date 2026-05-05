"use client";

import * as React from "react";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";

const STORAGE_KEY = "pbos:state:v1";
const CHANNEL = "pbos:sync";

function reducer(state: State, action: Action): State {
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

type Ctx = { state: State; dispatch: (a: Action) => void; ready: boolean };
const StoreCtx = React.createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, baseDispatch] = React.useReducer(reducer, SEED_STATE);
  const [ready, setReady] = React.useState(false);
  const channelRef = React.useRef<BroadcastChannel | null>(null);

  // Hydrate from localStorage + open broadcast channel.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as State;
        baseDispatch({ type: "hydrate", state: saved });
      }
    } catch {
      // ignore corrupted storage
    }
    setReady(true);

    const ch = new BroadcastChannel(CHANNEL);
    channelRef.current = ch;
    ch.onmessage = (e) => {
      const action = e.data as Action;
      if (!action || typeof action !== "object" || !("type" in action)) return;
      baseDispatch(action);
    };
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, []);

  // Persist on every state change.
  React.useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage might be full / disabled
    }
  }, [state, ready]);

  const dispatch = React.useCallback((action: Action) => {
    baseDispatch(action);
    channelRef.current?.postMessage(action);
  }, []);

  const value = React.useMemo<Ctx>(() => ({ state, dispatch, ready }), [state, dispatch, ready]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = React.useContext(StoreCtx);
  if (!c) throw new Error("useStore must be inside <StoreProvider>");
  return c;
}

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

// ID helper — short readable random.
export function nid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// Slug helper.
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

// Naive AI moderation flag — used by comment form.
export function aiFlag(body: string): "spam" | "toxic" | null {
  const lower = body.toLowerCase();
  if (/(buy|cheap|http|https|crypto|loan|viagra|followers)/.test(lower)) return "spam";
  if (/(idiot|stupid|hate you|moron)/.test(lower)) return "toxic";
  return null;
}

// Relative time (e.g. "12 min ago").
export function rel(ts: number): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  if (diff < 0) {
    const future = Math.abs(diff);
    if (future < 60_000) return "in a few seconds";
    if (future < 60 * 60_000) return `in ${Math.round(future / 60_000)} min`;
    if (future < 24 * 60 * 60_000) return `in ${Math.round(future / (60 * 60_000))} h`;
    return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }
  if (diff < 60_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.round(diff / (60 * 60_000))} h ago`;
  if (diff < 7 * 24 * 60 * 60_000) return `${Math.round(diff / (24 * 60 * 60_000))}d ago`;
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// Format date.
export function fmtDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
