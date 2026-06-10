/**
 * library slice contract.
 *
 * Convex-backed full slice — schema + queries + mutations under
 * `convex/features/library/`, views under `frontend/slices/library/`.
 * Mutations are unauthenticated (`internalMutation`); the consumer
 * wraps them with their own auth model. SEO override fields are reused
 * from the `seo` peer slice — install it first.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "library",
  version: "0.2.0",
  category: "data",
  kind: "full",
  provides: {
    tools: ["library.search", "library.get", "library.upvote"],
    components: ["LibraryIndex", "LibraryDetail", "PayloadRender", "CopyButton", "UpvotePanel"],
    utils: ["DEFAULT_COPY", "DEFAULT_KIND_LABELS", "ALL_KINDS"],
    hooks: [],
    convex: {
      tables: ["libraryItems", "libraryCollections"],
      rbac: [],
    },
  },
  requires: {
    deps: [
      { npm: "convex", range: "^1.17" },
      { npm: "next", range: "^15" },
      { npm: "react", range: "^18" },
    ],
    shadcn: [],
    env: [],
    peers: ["seo"],
  },
  conflicts: [],
});
