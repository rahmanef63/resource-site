/**
 * md-reader slice contract.
 *
 * Pure-UI read-only markdown renderer. Self-contained (own parser + inline
 * renderer) — no Convex, no env, no peers. Syncs with the notion slice via the
 * shared markdown grammar, not a code dependency.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "md-reader",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["MarkdownReader", "MdNodeView", "renderNodes"],
    utils: ["parseMarkdown", "renderInline", "tokenizeInline"],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "katex", range: "^0.16" },
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: [],
    env: [],
    peers: [],
  },
  conflicts: [],
});
