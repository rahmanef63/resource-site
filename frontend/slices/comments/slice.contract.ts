/**
 * Slice contract for `comments` — Phase A.
 *
 * Workspace-scoped threaded comments anchored to pages/blocks. Author identity
 * resolved via convex-auth. Soft-delete + resolve semantics in mutations.
 *
 * Current Convex schema (`convex/features/comments/schema.ts`) declares ONE
 * table named `comments` — predates the per-slice namespace rule.
 *
 * TODO(contract): tables need namespace rename migration — see Phase E planner
 * Aspirational prefix is `comment_` (e.g. `comment_threads`). Until the rename
 * lands, `requires.convex` is intentionally omitted so the validator's prefix
 * invariant doesn't fail; `provides.tables` reflects the actual current name.
 *
 * Backfilled from `slice.json` 2026-05-14 (Track H3 — new slice.json schema).
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "comments",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["comment.create", "comment.read"],
    deps: ["convex-auth"],
  },
  provides: {
    // TODO(contract): tables need namespace rename migration — see Phase E planner
    tables: ["comments"],
    hooks: ["useComments"],
  },
  conflicts: [],
});
