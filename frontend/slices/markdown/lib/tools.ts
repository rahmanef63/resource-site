// Agentic tool collection (pure — empty ctx). Parse/outline markdown with
// the slice's own parser so an agent can reason about a document's
// structure before editing it elsewhere.

import { defineToolCollection, obj, str } from "@/shared/agentic";
import { parseMarkdown } from "./parse";

export type MarkdownToolsCtx = Record<string, never>;

export const markdownTools = defineToolCollection<MarkdownToolsCtx>({
  namespace: "markdown",
  instructions: "Pure markdown helpers. parse renders structure, toc extracts headings; no side effects, safe to call freely.",
  tools: [
    {
      name: "parse",
      description: "Parse markdown into the slice's AST (returns node type counts + JSON of the first nodes).",
      parameters: obj({ "md!": str("markdown source") }),
      run: (_ctx, a) => {
        const nodes = parseMarkdown(a.md as string);
        const counts = new Map<string, number>();
        for (const n of nodes) counts.set(n.type, (counts.get(n.type) ?? 0) + 1);
        const tally = [...counts.entries()].map(([k, v]) => `${k}=${v}`).join(" ");
        return `${nodes.length} node(s): ${tally}\n${JSON.stringify(nodes.slice(0, 20))}`;
      },
    },
    {
      name: "toc",
      description: "Extract the heading outline (table of contents) from markdown.",
      parameters: obj({ "md!": str("markdown source") }),
      run: (_ctx, a) =>
        parseMarkdown(a.md as string)
          .filter((n) => n.type === "heading")
          .map((h) => `${"  ".repeat(h.level - 1)}h${h.level} ${h.text}`)
          .join("\n") || "no headings",
    },
  ],
});
