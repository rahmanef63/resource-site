/**
 * Slice contract for `comments` — v0.2.0.
 *
 * Polymorphic-target threaded comments. Author identity resolved via
 * convex-auth. Soft-delete + resolve semantics in mutations.
 *
 * Convex table renamed `comments` → `comment_threads` per per-slice namespace
 * rule. Migration script:
 * scripts/migrations/comments-v0.1.0-to-v0.2.0-polymorphic-target.ts.
 *
 * Per docs/contract-negotiations-2026-05-15.md §1.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "comments",
  version: "0.2.0",
  requires: {
    auth: "convex",
    rbac: ["comment.create", "comment.read"],
    convex: { prefix: "comment_", tables: ["comment_threads"] },
    deps: ["convex-auth"],
  },
  provides: {
    tables: ["comment_threads"],
    hooks: ["useComments"],
    utils: ["buildThread"],
    components: ["CommentsThread", "CommentsAnchor"],
  },
  conflicts: [],
  migrationFrom: {
    "0.1.0": "comments-v0.1.0-to-v0.2.0-polymorphic-target",
  },
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "needs-adapter",
      forbiddenTerms: ["pageId", "blockId", "targetType"],
      requiredProps: ["target", "bindings", "forbiddenWords", "pathMap"],
    },
  },
});
