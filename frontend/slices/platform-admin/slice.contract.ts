/**
 * Slice contract for `platform-admin` — Phase A · scaffold-only (no impl yet).
 *
 * Multi-tenant control plane. Distinct from kitab `admin` (per-instance
 * superadmin gated by SUPER_ADMIN_EMAIL). superspace's existing
 * `platform-admin` slice is the canonical reference implementation. Each
 * consumer adopting this slug MUST inject:
 *
 *   - `tenantTablesAdapter` — which Convex tables to sweep on hard-delete
 *     cascade + which to surface in KPI rollups. Consumer-domain specific.
 *   - `tierPresets` — the tier ladder (e.g. free/startup/business-pro/scale)
 *     with per-tier feature gates + quota matrix. Consumer-domain specific.
 *   - `kpiSources` — Convex query function refs returning per-tenant KPI
 *     snapshots (member count, billing health, audit cadence). Consumer-domain.
 *
 * Contract is published BEFORE the canonical implementation lands in kitab
 * so consumers can adopt the slug + start mapping their existing platform-admin
 * code against the adapter shape. UP-sync ingestion via /rr-send from
 * superspace expected once the operator promotes the structural patterns
 * (top bar + drawer + RBAC matrix + KPI widget grid) into a portable subset.
 *
 * See docs/contract-negotiations-2026-05-15.md §4 for the operator decision
 * and superspace's `platform-admin` blocker list.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "platform-admin",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: [
      "platform.workspace.list",
      "platform.workspace.delete",
      "platform.user.delete",
      "platform.tier.set",
    ],
    env: ["PLATFORM_ADMIN_EMAILS"],
    convex: {
      prefix: "padmin_",
      tables: ["padmin_audit", "padmin_kpi_snapshot"],
    },
    deps: ["convex-auth", "audit-log"],
  },
  provides: {
    routes: ["/platform-admin"],
    hooks: ["usePlatformAdmin", "useTenantHealth"],
    tables: ["padmin_audit", "padmin_kpi_snapshot"],
    components: ["PlatformAdminShell", "TenantHealthCard", "TierSetGate"],
  },
  conflicts: [],
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "needs-adapter",
      requiredProps: ["tenantTablesAdapter", "tierPresets", "kpiSources"],
    },
  },
});
