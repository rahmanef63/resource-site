// Agentic tool collection. The library is Convex-backed but consumer-wired,
// so the ctx is a small bindings contract over your queries/mutations.

import { defineToolCollection, obj, str } from "@/shared/agentic";

export type LibraryToolsCtx = {
  /** Resolve to rendered row lines (slug, title, kind). */
  list: (q: { kind?: string; query?: string }) => Promise<string>;
  detail: (slug: string) => Promise<string>;
  upvote: (slug: string) => Promise<string>;
};

export const libraryTools = defineToolCollection<LibraryToolsCtx>({
  namespace: "library",
  instructions: "Content library. search or get before upvote; upvote mutates a shared count.",
  tools: [
    {
      name: "search",
      description: "List/search library items (optionally filter by kind).",
      parameters: obj({ query: str("search text"), kind: str("item kind filter") }),
      run: (ctx, a) => ctx.list({ kind: a.kind as string | undefined, query: a.query as string | undefined }),
    },
    {
      name: "get",
      description: "Read one library item by slug (full payload).",
      parameters: obj({ "slug!": str("item slug") }),
      run: (ctx, a) => ctx.detail(a.slug as string),
    },
    {
      name: "upvote",
      description: "Upvote a library item.",
      parameters: obj({ "slug!": str("item slug") }),
      run: (ctx, a) => ctx.upvote(a.slug as string),
    },
  ],
});
