/**
 * QSR / FNB workspace template seeder.
 *
 * Wraps `workspace.etlBootstrap:bootstrapEtlTarget` with FNB-bundle defaults
 * so platform admin can spin up a new restaurant workspace in one call.
 *
 * Usage (CLI / admin key):
 *
 *   npx convex run --url $TARGET_CONVEX_URL --admin-key $TARGET_CONVEX_ADMIN_KEY \
 *     features/qsr/seed:seedFnbWorkspace \
 *     '{"workspaceName":"Rocket Chicken — Gowa","workspaceSlug":"rc-samata-gowa","ownerClerkId":"user_X","ownerEmail":"x@y.com"}'
 *
 * The wrapper hardcodes:
 *   - bundleId: "fnb"
 *   - enabledFeatures: ["qsr-dashboard", "import-export", "daily-closing",
 *     "analytics", "cash-flow-forecast", "audit-log", "contacts"]
 *   - workspaceType: "organization" (default; override via args)
 */

import { v } from "convex/values"
import { anyApi } from "convex/server"
import { internalMutation } from "../../_generated/server"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny: any = anyApi

const DEFAULT_FNB_FEATURES = [
  "qsr-dashboard",
  "qsr-payables",
  "qsr-petty-cash",
  "qsr-master-data",
  "qsr-allowances",
  "qsr-product-changes",
  "import-export",
  "daily-closing",
  "analytics",
  "cash-flow-forecast",
  "accounting",
  "audit-log",
  "branch-health-scoring",
  "contacts",
]

export const seedFnbWorkspace = internalMutation({
  args: {
    workspaceName: v.string(),
    workspaceSlug: v.string(),
    workspaceType: v.optional(
      v.union(
        v.literal("organization"),
        v.literal("institution"),
        v.literal("group"),
        v.literal("family"),
        v.literal("personal"),
      ),
    ),
    parentWorkspaceId: v.optional(v.id("workspaces")),
    ownerClerkId: v.string(),
    ownerEmail: v.string(),
    ownerName: v.optional(v.string()),
    /** Extra features to enable beyond the FNB defaults. */
    extraFeatures: v.optional(v.array(v.string())),
    sourceTenantSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const enabled = Array.from(
      new Set([...DEFAULT_FNB_FEATURES, ...(args.extraFeatures ?? [])]),
    )
    return ctx.runMutation(apiAny.workspace.etlBootstrap.bootstrapEtlTarget, {
      workspaceName: args.workspaceName,
      workspaceSlug: args.workspaceSlug,
      workspaceType: args.workspaceType ?? "organization",
      parentWorkspaceId: args.parentWorkspaceId,
      ownerClerkId: args.ownerClerkId,
      ownerEmail: args.ownerEmail,
      ownerName: args.ownerName,
      bundleId: "fnb",
      enabledFeatures: enabled,
      sourceTenantSlug: args.sourceTenantSlug ?? "fnb-template",
    })
  },
})
