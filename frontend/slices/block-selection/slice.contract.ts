/**
 * block-selection slice contract.
 *
 * Framework-agnostic multi-selection for vertical lists. Pure-UI primitive —
 * no convex tables, no deps beyond `@/lib/utils`. Lifted from
 * notion-page-clone's block-selection slice; pairs with notion-shell blocks.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "block-selection",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["BlockSelectionProvider", "SelectableBlock"],
    utils: [],
    hooks: ["useBlockSelection"],
    types: ["BlockSelectionCtx", "SelectableBlockProps"],
  },
  requires: {
    npm: [],
    shadcn: [],
    env: [],
    peers: [],
    routes: [],
    tables: [],
  },
});
