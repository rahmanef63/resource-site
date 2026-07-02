"use client"

import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { McpAdminView, type McpTokenRow } from "./McpAdminView"

/**
 * `CreateYourMcpPage` — dashboard entry for the create-your-mcp slice.
 *
 * NON-FUNCTIONAL SCAFFOLD: renders the admin view (connector-setup panel +
 * token table) with stubbed data. Wiring it live requires the Convex HTTP
 * client in `../lib/convex-http.ts` plus `api.features.createYourMcp.query`
 * (adminList / findToken) and the `revokeToken` mutation. Until then the token
 * list is empty and Revoke is a no-op.
 */
export default function CreateYourMcpPage() {
  // Stubbed: no live token rows until the convex client is wired.
  const rows: McpTokenRow[] = []
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""

  const onRevoke = async () => {
    // No-op in the scaffold. Wire to
    // `api.features.createYourMcp.mutation.revokeToken` when going live.
  }

  return (
    <FeatureShell featureId="create-your-mcp">
      <McpAdminView rows={rows} siteUrl={siteUrl} onRevoke={onRevoke} />
    </FeatureShell>
  )
}
