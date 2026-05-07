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

    default:
      return state;
  }
}

const { Provider, useStore } = createTemplateStore<State, Action>({
  storageKey: "konsultan:state:v1",
  channel: "konsultan:sync",
  seed: SEED_STATE,
  reducer,
});

export const StoreProvider = Provider;
export { useStore };

export function useClients() {
  const { state } = useStore();
  return state.clients;
}
export function useProposals() {
  const { state } = useStore();
  return state.proposals;
}
export function useContracts() {
  const { state } = useStore();
  return state.contracts;
}
export function useProjects() {
  const { state } = useStore();
  return state.projects;
}
export function useInvoices() {
  const { state } = useStore();
  return state.invoices;
}
export function useDocuments() {
  const { state } = useStore();
  return state.documents;
}

export { nid, slugify, fmtDate, rel } from "@/components/templates/_shared/utils";
