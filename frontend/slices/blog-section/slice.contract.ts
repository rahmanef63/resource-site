/**
 * blog-section slice contract.
 *
 * Pure-UI blog surface. Covers list (index) and detail (single post) views.
 * Prop-driven, server-component only, no Convex tables, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "blog-section",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["BlogListSection", "BlogPostView", "BlogCard", "PostMeta"],
    utils: [],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "next", range: "^15" },
    ],
    shadcn: ["badge", "button", "card", "separator"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
