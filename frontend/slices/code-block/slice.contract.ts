/**
 * code-block slice contract.
 *
 * highlight.js-powered code block. Language picker + copy button.
 * Pure-UI primitive — no convex tables. Lifted from notion-page-clone (Nosion).
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "code-block",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["CodeBlock"],
    utils: ["CODE_LANGUAGES", "normalizeLang"],
    hooks: [],
    types: ["CodeBlockProps"],
  },
  requires: {
    npm: ["highlight.js@^11.11.1"],
    shadcn: ["button", "dropdown-menu"],
    env: [],
    peers: [],
    routes: [],
    tables: [],
  },
});
