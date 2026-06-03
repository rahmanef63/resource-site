/**
 * Slice contract for `mdx-blog` — v0.2.0.
 *
 * Static file-based MDX blog. No backend, no auth, no Convex tables.
 *
 * v0.2.0 introduces the `defineMdxBlog(opts)` portable factory + 4 config
 * props (basePath / contentDir / labels.list / nav). UP-synced from
 * content-rahmanef-com (commit `c6729a5`, Wave N+3.1) on 2026-05-15.
 *
 * Pure UI/factory refactor — no data shape change → no migrationFrom entry.
 *
 * Per docs/contract-negotiations-2026-05-15.md §2.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "mdx-blog",
  version: "0.2.0",
  requires: {
    auth: "none",
  },
  provides: {
    routes: ["/blog", "/blog/[slug]", "/rss.xml"],
    components: ["BlogList", "BlogPost"],
  },
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "portable",
      // Forbid hardcoding consumer-domain blog literals at module scope —
      // content-rahmanef-com's specific copy/IDs must NOT leak into the slice.
      // Allowed in MDX content files (those live OUTSIDE the slice tree).
      forbiddenTerms: ["rahmanef", "content.rahmanef.com"],
      // 4 optional props the factory accepts; all defaulted via
      // MDX_BLOG_DEFAULTS so a no-arg call still renders the legacy surface.
      requiredProps: ["basePath", "contentDir", "labels", "nav"],
    },
  },
});
