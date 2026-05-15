/**
 * Slice contract for `mdx-blog` — Phase A.
 *
 * Static file-based MDX blog. No backend, no auth, no Convex tables.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "mdx-blog",
  version: "0.1.0",
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
    },
  },
});
