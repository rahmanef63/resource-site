/**
 * markdown slice contract.
 *
 * Markdown (.md) page container with optional CRUD surfaces (read / write /
 * review-with-comments) plus mermaid diagram + recharts chart rendering from
 * fenced blocks. Self-contained (own parser + inline renderer) — no Convex,
 * no env, no peers. Syncs with the notion slice via the shared markdown
 * grammar, not a code dependency.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "markdown",
  version: "0.2.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: [
      "MarkdownPage", "MarkdownReader", "MdNodeView", "renderNodes",
      "MermaidBlock", "ChartBlock",
    ],
    utils: ["parseMarkdown", "renderInline", "tokenizeInline", "newCommentId", "commentsFor", "openCount"],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "katex", range: "^0.16" },
      { npm: "mermaid", range: "^11" },
      { npm: "recharts", range: "^3" },
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: ["button", "tabs", "textarea"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
