"use client";

import * as React from "react";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";

const STORAGE_KEY = "agency-studio:state:v1";
const CHANNEL = "agency-studio:sync";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return SEED_STATE;

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

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) baseDispatch({ type: "hydrate", state: JSON.parse(raw) as State });
    } catch { /* ignore */ }
    setReady(true);

    const ch = new BroadcastChannel(CHANNEL);
    channelRef.current = ch;
    ch.onmessage = (e) => {
      const action = e.data as Action;
      if (action && typeof action === "object" && "type" in action) baseDispatch(action);
    };
    return () => { ch.close(); channelRef.current = null; };
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
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

export const useProjects = () => useStore().state.projects;
export const useFeaturedProjects = () => useProjects().filter((p) => p.featured);
export const useProject = (slug: string) => useProjects().find((p) => p.slug === slug) ?? null;
export const useClients = () => useStore().state.clients;
export const useServices = () => useStore().state.services;
export const useLeads = () => useStore().state.leads;

export function nid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function fmtDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function rel(ts: number): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.round(diff / (60 * 60_000))} h ago`;
  if (diff < 7 * 24 * 60 * 60_000) return `${Math.round(diff / (24 * 60 * 60_000))}d ago`;
  return fmtDate(ts);
}
