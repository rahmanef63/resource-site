import type { PagesAction, PagesSlice } from "../types";

/**
 * Pure reducer for the pages slice. Mount into your app's root reducer
 * (or use the bundled `localPagesStore` adapter for a client-only,
 * localStorage-backed store):
 *
 *   case "PAGE_CREATE":
 *   case "PAGE_UPDATE":
 *   case "PAGE_DELETE":
 *   case "PAGE_REORDER_BLOCK":
 *     return { ...state, pages: pagesReducer(state, action).pages };
 *
 * `blocks[]` is the only composition primitive — there is no section
 * bridge to keep the slice self-contained.
 */
export function pagesReducer(state: PagesSlice, action: PagesAction): PagesSlice {
  switch (action.type) {
    case "PAGE_REPLACE_ALL":
      return { ...state, pages: action.payload };

    case "PAGE_CREATE":
      return { ...state, pages: [...state.pages, action.payload] };

    case "PAGE_UPDATE": {
      const { id, patch } = action.payload;
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.id === id && !p.systemPage ? { ...p, ...patch, updatedAt: Date.now() } : p,
        ),
      };
    }

    case "PAGE_DELETE":
      return {
        ...state,
        pages: state.pages.filter((p) => !(p.id === action.payload.id && !p.systemPage)),
      };

    case "PAGE_REORDER_BLOCK": {
      const { id, from, to } = action.payload;
      return {
        ...state,
        pages: state.pages.map((p) => {
          if (p.id !== id || p.systemPage) return p;
          if (from === to) return p;
          if (from < 0 || to < 0 || from >= p.blocks.length || to >= p.blocks.length) return p;
          const next = p.blocks.slice();
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { ...p, blocks: next, updatedAt: Date.now() };
        }),
      };
    }

    default:
      return state;
  }
}
