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
  storageKey: "konsultan:state:v3-landing",
  channel: "konsultan:sync",
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
