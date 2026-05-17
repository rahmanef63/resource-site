// Shared types for the SEO generator action. Split out of `actions.ts` to
// keep the entrypoint ≤200 LOC (audit-file-size cap).

export type GenInput = {
  table: "blogPosts" | "upcomingProjects" | "portfolioItems";
  rowId: string;
  title: string;
  body: string;
  category?: string;
  hint?: string;
};

export type AnthropicResponse = {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
  error?: { message?: string };
};

export type GenOut = {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  focusKeyphrase: string;
  structuredType?: string;
};
