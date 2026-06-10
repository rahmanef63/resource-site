// Agentic tool collection. Ctx = injectable bindings over the consumer's
// Convex SEO mutations (seo.write + requireAdmin enforced server-side;
// ANTHROPIC_API_KEY never reaches this layer).

import { defineToolCollection, obj, str } from "@/shared/agentic";

export type SeoToolsCtx = {
  /** Server-gated (seo.write): generate metadata for a path/content. */
  generate: (input: { path: string; content?: string }) => Promise<string>;
  /** Server-gated (seo.write): generate AND persist. */
  generateAndApply: (input: { path: string; content?: string }) => Promise<string>;
};

export const seoTools = defineToolCollection<SeoToolsCtx>({
  namespace: "seo",
  tools: [
    {
      name: "generate",
      description: "Generate SEO metadata for a page (server-gated: seo.write). Returns the proposal without applying.",
      parameters: obj({ "path!": str("page path, e.g. /pricing"), content: str("page content to summarize") }),
      run: (ctx, a) => ctx.generate({ path: a.path as string, content: a.content as string | undefined }),
    },
    {
      name: "generate_and_apply",
      description: "Generate AND persist SEO metadata for a page (server-gated: seo.write).",
      parameters: obj({ "path!": str("page path"), content: str("page content to summarize") }),
      run: (ctx, a) => ctx.generateAndApply({ path: a.path as string, content: a.content as string | undefined }),
    },
  ],
});
