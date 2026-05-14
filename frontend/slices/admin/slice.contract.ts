/**
 * Slice contract for `admin` — Phase A.
 *
 * Generic admin shell slice. Server-only aggregator across other slices; owns
 * NO Convex tables (see `convex/features/admin/schema.ts` → `tables = {}`).
 * Gated by `requireAdmin` (convex-auth identity + optional SUPER_ADMIN_EMAIL).
 *
 * Backfilled from `slice.json` 2026-05-14 (Track H3 — new slice.json schema).
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "admin",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["admin.read"],
    env: ["SUPER_ADMIN_EMAIL"],
    deps: ["convex-auth"],
  },
  provides: {
    components: ["AdminShell"],
  },
  conflicts: [],
});
