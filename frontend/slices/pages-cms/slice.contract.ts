/**
 * pages-cms slice contract.
 *
 * A block-composed multi-page CMS. Pure UI — ships a localStorage
 * adapter for a zero-backend run, plus a reducer + store context the
 * consumer can wire to their own backend. No Convex tables, no env, no
 * peers. Self-contained: no cross-slice / template coupling.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "pages-cms",
  version: "0.1.0",
  category: "content",
  kind: "ui",
  provides: {
    tools: [],
    components: [
      "PagesView",
      "PageEditorView",
      "PageEditorBlocks",
      "BlockEditor",
      "BlockRenderer",
      "PageCreateDialog",
      "PagesProvider",
      "LocalPagesProvider",
    ],
    utils: [
      "pagesReducer",
      "duplicatePage",
      "blankPage",
      "buildPageNavItems",
      "defaultPages",
      "emptyBlock",
    ],
    hooks: ["usePagesStore", "usePage"],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [{ npm: "lucide-react", range: "^0.400.0" }],
    shadcn: [
      "badge",
      "button",
      "table",
      "input",
      "textarea",
      "label",
      "select",
      "switch",
      "card",
      "dialog",
    ],
    env: [],
    peers: [],
  },
  conflicts: [],
});
