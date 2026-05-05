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

const { Provider, useStore } = createTemplateStore<State, Action>({
  storageKey: "agency-studio:state:v1",
  channel: "agency-studio:sync",
  seed: SEED_STATE,
  reducer,
});

export const StoreProvider = Provider;
export { useStore };

export const useProjects = () => useStore().state.projects;
export const useFeaturedProjects = () => useProjects().filter((p) => p.featured);
export const useProject = (slug: string) => useProjects().find((p) => p.slug === slug) ?? null;
export const useClients = () => useStore().state.clients;
export const useServices = () => useStore().state.services;
export const useLeads = () => useStore().state.leads;

export { nid, fmtDate, rel } from "@/components/templates/_shared/utils";
