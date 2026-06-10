/**
 * Slice contract for `vector-search` — Phase A.
 *
 * Embeddings-based search using Convex vector indexes. Inserts compute
 * OpenAI `text-embedding-3-small` (1536d) via a server action; queries use
 * cosine similarity over the Convex `vectorIndex`. Convex table follows the
 * 2026-05-12 namespace decision (`vector_` prefix) — the existing
 * non-namespaced `searchDocuments` table is renamed to
 * `vector_search_documents` on consumer adoption.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "vector-search",
  version: "0.2.0",
  requires: {
    auth: "convex",
    rbac: ["search.query", "search.index", "search.reindex"],
    env: ["OPENAI_API_KEY"],
    convex: {
      prefix: "vector_",
      tables: ["vector_search_documents"],
    },
    deps: ["convex-auth"],
  },
  provides: {
    tools: ["vector-search.query", "vector-search.index", "vector-search.reindex"],
    tables: ["vector_search_documents"],
    routes: ["/search"],
    components: ["SearchPage"],
  },
  conflicts: [],
  generalization: {
    level: "portable",
  },
});
