// Framework-neutral vector-search tool contract. The host injects the actual
// search/index/reindex transport and owns provider credentials, persistence,
// authorization, embedding model choice, and destructive reindex policy.

import { defineToolCollection } from "@/shared/agentic/define";
import { noArgs, num, obj, str } from "@/shared/agentic/schema";

export type VectorSearchCtx = {
  search: (query: string, topK?: number) => Promise<string>;
  /** Server-gated by the host (suggested permission: search.index). */
  index: (text: string, title?: string) => Promise<string>;
  /** Server-gated by the host (suggested permission: search.reindex). */
  reindex: () => Promise<string>;
};

export const vectorSearchTools = defineToolCollection<VectorSearchCtx>({
  namespace: "vector-search",
  instructions:
    "Headless vector-search adapter. query reads through the injected host transport; index/reindex are host-authorized writes. Reindex is expensive/destructive and requires confirmation.",
  tools: [
    {
      name: "query",
      description: "Semantic search through the host-provided vector-search transport.",
      parameters: obj({
        "query!": str("natural-language query"),
        topK: num("results (default 5)", { min: 1, max: 50 }),
      }),
      run: (ctx, a) => ctx.search(a.query as string, a.topK as number | undefined),
    },
    {
      name: "index",
      description: "Index one document through the host-provided transport.",
      parameters: obj({ "text!": str("document text"), title: str("document title") }),
      run: (ctx, a) => ctx.index(a.text as string, a.title as string | undefined),
    },
    {
      name: "reindex",
      dangerous: true,
      description: "Rebuild the host vector index. Expensive/destructive — confirm first.",
      parameters: noArgs,
      run: (ctx) => ctx.reindex(),
    },
  ],
});
