/**
 * database-cell-selection slice contract.
 *
 * useDragFill + SelectableCell — drag-fill behavior for grid editors.
 * Pure-UI primitives. Lifted from notion-page-clone (Nosion).
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "database-cell-selection",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["SelectableCell"],
    utils: [],
    hooks: ["useDragFill"],
    types: ["FillSource"],
  },
  requires: { npm: [], shadcn: [], env: [], peers: [], routes: [], tables: [] },
});
