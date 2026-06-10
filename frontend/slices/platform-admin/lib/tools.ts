// Agentic tool collection (Tier A* — ADMIN). platform-admin is adapter-driven
// (tenantTablesAdapter / tierPresets / kpiSources are injected by the
// consumer), so the agent ctx is the same shape: a small server-gated
// contract. EVERY method must be bound to an implementation that enforces
// the platform.* RBAC (requirePermission) — tools only forward.

import { defineToolCollection, bool, noArgs, obj, str } from "@/shared/agentic";

export type PlatformAdminCtx = {
  /** KPI / health read-back (server-gated: platform.workspace.list). */
  metrics: () => Promise<string>;
  /** Flip a feature flag (server-gated). */
  setFeatureFlag: (key: string, value: boolean) => Promise<string>;
  /** Set a tenant's tier (server-gated: platform.tier.set). */
  setTier: (tenantId: string, tier: string) => Promise<string>;
};

export const platformAdminTools = defineToolCollection<PlatformAdminCtx>({
  namespace: "platform-admin",
  tools: [
    {
      name: "metrics",
      description: "Read platform KPIs / tenant health summary.",
      parameters: noArgs,
      run: (ctx) => ctx.metrics(),
    },
    {
      name: "feature_flag.set",
      dangerous: true,
      description: "Enable or disable a platform feature flag (server-gated).",
      parameters: obj({ "key!": str("flag key"), "value!": bool("enabled") }),
      run: (ctx, a) => ctx.setFeatureFlag(a.key as string, a.value as boolean),
    },
    {
      name: "tier.set",
      dangerous: true,
      description: "Set a tenant's tier preset (server-gated: platform.tier.set).",
      parameters: obj({ "tenantId!": str("tenant id"), "tier!": str("tier preset slug") }),
      run: (ctx, a) => ctx.setTier(a.tenantId as string, a.tier as string),
    },
  ],
});
