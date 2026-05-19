/**
 * equation slice contract.
 *
 * KaTeX-rendered equation block. Pure-UI primitive — no convex tables.
 * Lifted from notion-page-clone (Nosion) via rr-sync pipeline.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "equation",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["EquationBlock"],
    utils: [],
    hooks: [],
    types: ["EquationBlockProps"],
  },
  requires: {
    npm: ["katex@^0.16.45"],
    shadcn: ["button"],
    env: [],
    peers: [],
    routes: [],
    tables: [],
  },
});
