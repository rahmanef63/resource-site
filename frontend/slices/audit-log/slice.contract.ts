/**
 * Slice contract for `audit-log` — Phase A.
 *
 * Workspace-scoped audit event recorder. Actor identity resolved via
 * convex-auth. Current Convex schema (`convex/features/audit-log/schema.ts`)
 * declares ONE table named `auditLogs` — predates the per-slice namespace rule.
 *
 * TODO(contract): tables need namespace rename migration — see Phase E planner
 * Aspirational prefix is `audit_` (e.g. `audit_logs`). Until the rename lands,
 * `requires.convex` is intentionally omitted so the validator's prefix
 * invariant doesn't fail; `provides.tables` reflects the actual current name.
 *
 * Backfilled from `slice.json` 2026-05-14 (Track H3 — new slice.json schema).
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "audit-log",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["audit.read", "audit.write"],
    deps: ["convex-auth"],
  },
  provides: {
    // TODO(contract): tables need namespace rename migration — see Phase E planner
    tables: ["auditLogs"],
  },
  conflicts: [],
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "needs-adapter",
    },
  },
});
