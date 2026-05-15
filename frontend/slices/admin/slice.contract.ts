/**
 * Slice contract for `admin` — v0.2.0.
 *
 * Generic admin shell slice. Server-only aggregator across other slices; owns
 * NO Convex tables (see `convex/features/admin/schema.ts` → `tables = {}`).
 * Gated by `requireAdmin` (convex-auth identity + optional SUPER_ADMIN_EMAIL).
 *
 * v0.2.0 introduces the `nav-from-registry` portable factory: instead of
 * hardcoding count tables + activity routes, the slice derives them from a
 * consumer-supplied `SliceRegistryAdapter` (each slice declares its own
 * `admin.activity[]` row). UP-synced from rahmanef.com (commit `b542389`,
 * Wave N+3.1) on 2026-05-15.
 *
 * Pure UI/factory refactor — no Convex schema change → no migrationFrom entry.
 * The admin slice still owns zero tables (`tables = {}`).
 *
 * Distinct from `platform-admin`: this is the PER-INSTANCE superadmin slice
 * (env `SUPER_ADMIN_EMAIL`); `platform-admin` is the multi-tenant control
 * plane (env `PLATFORM_ADMIN_EMAILS`). See docs/contract-negotiations-2026-05-15.md §4.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "admin",
  version: "0.2.0",
  requires: {
    auth: "convex",
    rbac: ["admin.read"],
    env: ["SUPER_ADMIN_EMAIL"],
    deps: ["convex-auth"],
  },
  provides: {
    // v0.2.0 portable surface — pure helpers exported from frontend/slices/admin/lib.
    components: [
      "AdminPage",
      "buildAdminStats",
      "DEFAULT_ADMIN_LABELS",
      "resolveAdminLabels",
    ],
  },
  conflicts: [],
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "portable",
      // Forbid any rahmanef-domain literal from leaking into the kitab copy.
      // Per-instance admin must NOT bake in a consumer brand identity.
      forbiddenTerms: ["rahmanef", "rahmanef.com"],
      // Consumer-supplied props (registry adapter + UI labels + the count-
      // table reader seam). Listed so `rr-prep` can audit consumer wirings
      // against the portable surface.
      requiredProps: ["sliceRegistry", "queryTable", "labels"],
    },
  },
});
