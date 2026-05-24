// Wirausaha OS state reducer. Split out of `store.tsx` (LOC cap).
// Pure function over (State, Action) — no React dependency.

import { pagesReducer } from "@/components/templates/_shared/pages/reducer";
import { landingReducer } from "@/components/templates/_shared/landing/reducer";
import type { Action, State } from "./types";
import { SEED_STATE } from "./seed";

/** Generic upsert: replace by id, prepend if new. */
function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  return idx >= 0 ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
}

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

    case "business.upsert":   return { ...state, businesses: upsertById(state.businesses, action.business) };
    case "business.delete":   return { ...state, businesses: state.businesses.filter((b) => b.id !== action.id) };
    case "product.upsert":    return { ...state, products: upsertById(state.products, action.product) };
    case "product.delete":    return { ...state, products: state.products.filter((p) => p.id !== action.id) };
    case "order.upsert":      return { ...state, orders: upsertById(state.orders, action.order) };
    case "order.delete":      return { ...state, orders: state.orders.filter((o) => o.id !== action.id) };
    case "customer.upsert":   return { ...state, customers: upsertById(state.customers, action.customer) };
    case "customer.delete":   return { ...state, customers: state.customers.filter((c) => c.id !== action.id) };
    case "finance.upsert":    return { ...state, finance: upsertById(state.finance, action.record) };
    case "finance.delete":    return { ...state, finance: state.finance.filter((f) => f.id !== action.id) };
    case "staff.upsert":      return { ...state, staff: upsertById(state.staff, action.member) };
    case "staff.delete":      return { ...state, staff: state.staff.filter((s) => s.id !== action.id) };
    case "review.upsert":     return { ...state, reviews: upsertById(state.reviews, action.review) };
    case "review.delete":     return { ...state, reviews: state.reviews.filter((r) => r.id !== action.id) };
    case "promotion.upsert":  return { ...state, promotions: upsertById(state.promotions, action.promotion) };
    case "promotion.delete":  return { ...state, promotions: state.promotions.filter((p) => p.id !== action.id) };
    case "supplier.upsert":   return { ...state, suppliers: upsertById(state.suppliers, action.supplier) };
    case "supplier.delete":   return { ...state, suppliers: state.suppliers.filter((s) => s.id !== action.id) };

    default:
      return state;
  }
}
