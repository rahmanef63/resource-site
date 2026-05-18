"use client";

import * as React from "react";
import { createTemplateStore } from "@/components/templates/_shared/hooks/create-template-store";
import { pagesReducer } from "@/components/templates/_shared/pages/reducer";
import {
  PagesProvider,
  type PagesStore,
} from "@/components/templates/_shared/pages/pages-context";
import type { PageEntry } from "@/components/templates/_shared/pages/types";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return SEED_STATE;

    case "PAGE_CREATE":
    case "PAGE_UPDATE":
    case "PAGE_DELETE":
    case "PAGE_REORDER_BLOCK": {
      const next = pagesReducer({ pages: state.pages }, action);
      return { ...state, pages: next.pages };
    }

    case "business.upsert": {
      const idx = state.businesses.findIndex((b) => b.id === action.business.id);
      const businesses =
        idx >= 0
          ? state.businesses.map((b) => (b.id === action.business.id ? action.business : b))
          : [action.business, ...state.businesses];
      return { ...state, businesses };
    }
    case "business.delete":
      return { ...state, businesses: state.businesses.filter((b) => b.id !== action.id) };

    case "product.upsert": {
      const idx = state.products.findIndex((p) => p.id === action.product.id);
      const products =
        idx >= 0
          ? state.products.map((p) => (p.id === action.product.id ? action.product : p))
          : [action.product, ...state.products];
      return { ...state, products };
    }
    case "product.delete":
      return { ...state, products: state.products.filter((p) => p.id !== action.id) };

    case "order.upsert": {
      const idx = state.orders.findIndex((o) => o.id === action.order.id);
      const orders =
        idx >= 0
          ? state.orders.map((o) => (o.id === action.order.id ? action.order : o))
          : [action.order, ...state.orders];
      return { ...state, orders };
    }
    case "order.delete":
      return { ...state, orders: state.orders.filter((o) => o.id !== action.id) };

    case "customer.upsert": {
      const idx = state.customers.findIndex((c) => c.id === action.customer.id);
      const customers =
        idx >= 0
          ? state.customers.map((c) => (c.id === action.customer.id ? action.customer : c))
          : [action.customer, ...state.customers];
      return { ...state, customers };
    }
    case "customer.delete":
      return { ...state, customers: state.customers.filter((c) => c.id !== action.id) };

    case "finance.upsert": {
      const idx = state.finance.findIndex((f) => f.id === action.record.id);
      const finance =
        idx >= 0
          ? state.finance.map((f) => (f.id === action.record.id ? action.record : f))
          : [action.record, ...state.finance];
      return { ...state, finance };
    }
    case "finance.delete":
      return { ...state, finance: state.finance.filter((f) => f.id !== action.id) };

    case "staff.upsert": {
      const idx = state.staff.findIndex((s) => s.id === action.member.id);
      const staff =
        idx >= 0
          ? state.staff.map((s) => (s.id === action.member.id ? action.member : s))
          : [action.member, ...state.staff];
      return { ...state, staff };
    }
    case "staff.delete":
      return { ...state, staff: state.staff.filter((s) => s.id !== action.id) };

    default:
      return state;
  }
}

const { Provider, useStore } = createTemplateStore<State, Action>({
  storageKey: "wirausaha:state:v2-pages",
  channel: "wirausaha:sync",
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <PagesAdapter>{children}</PagesAdapter>
    </Provider>
  );
}
export { useStore };
export const usePages = () => useStore().state.pages;

export function useBusinesses() {
  const { state } = useStore();
  return state.businesses;
}
export function useProducts() {
  const { state } = useStore();
  return state.products;
}
export function useOrders() {
  const { state } = useStore();
  return state.orders;
}
export function useCustomers() {
  const { state } = useStore();
  return state.customers;
}
export function useFinance() {
  const { state } = useStore();
  return state.finance;
}
export function useStaff() {
  const { state } = useStore();
  return state.staff;
}

export { nid, slugify, fmtDate, rel } from "@/components/templates/_shared/utils";
