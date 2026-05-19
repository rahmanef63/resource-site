import type { LandingAction, LandingSlice } from "./types";

/**
 * Pure reducer for the landing slice. Mount in your template's root
 * reducer:
 *
 *   case "LANDING_UPSERT":
 *   case "LANDING_DELETE":
 *     return { ...state, ...landingReducer(state, action) };
 */
export function landingReducer(state: LandingSlice, action: LandingAction): LandingSlice {
  switch (action.type) {
    case "LANDING_UPSERT": {
      const idx = state.landingSections.findIndex((s) => s.id === action.payload.id);
      const landingSections =
        idx >= 0
          ? state.landingSections.map((s) =>
              s.id === action.payload.id ? action.payload : s,
            )
          : [...state.landingSections, action.payload];
      return { landingSections };
    }
    case "LANDING_DELETE":
      return {
        landingSections: state.landingSections.filter((s) => s.id !== action.payload.id),
      };
    default:
      return state;
  }
}
