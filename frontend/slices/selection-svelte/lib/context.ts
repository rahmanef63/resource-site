import type { SelectionApi } from "./selection";

export const SELECTION_CONTEXT = Symbol("rr-selection");
export type SelectionContext = SelectionApi;
