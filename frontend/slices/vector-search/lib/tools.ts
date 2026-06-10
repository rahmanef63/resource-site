// Agentic tool collection. Ctx = injectable bindings over the consumer's
// Convex vector index + embedding action. index/reindex are server-gated
// (search.index / search.reindex); OPENAI_API_KEY never reaches this layer.

import { defineToolCollection, noArgs, num, obj, str } from "@/shared/agentic";

export type VectorSearchCtx = {
  search: (query: string, topK?: number) => Promise<string>;
  /** Server-gated (search.index). */
  index: (text: string, title?: string) => Promise<string>;
  /** Server-gated (search.reindex). */
  reindex: () => Promise<string>;
};

export const vectorSearchTools = defineToolCollection<VectorSearchCtx>({
  namespace: "vector-search",
  tools: [
    {
      name: "query",
      description: "Semantic search over the vector index (cosine similarity).",
      parameters: obj({ "query!": str("natural-language query"), topK: num("results (default 5)", { min: 1, max: 50 }) }),
      run: (ctx, a) => ctx.search(a.query as string, a.topK as number | undefined),
    },
    {
      name: "index",
      description: "Embed + index a document (server-gated: search.index).",
      parameters: obj({ "text!": str("document text"), title: str("document title") }),
      run: (ctx, a) => ctx.index(a.text as string, a.title as string | undefined),
    },
    {
      name: "reindex",
      description: "Rebuild the whole index (server-gated: search.reindex; expensive).",
      parameters: noArgs,
      run: (ctx) => ctx.reindex(),
    },
  ],
});
