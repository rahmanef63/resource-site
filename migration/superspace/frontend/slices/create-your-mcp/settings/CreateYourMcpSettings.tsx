"use client"

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"

export function CreateYourMcpGeneralSettings() {
  return (
    <SettingsSection title="General" description="Pengaturan dasar untuk Create Your MCP">
      <div className="text-sm text-muted-foreground">
        Scaffold non-fungsional — UI + template route OAuth/PKCE sudah kompilasi,
        tapi klien HTTP Convex masih stub. Setel <code>MCP_API_KEY</code> dan
        <code> MCP_OAUTH_ALLOWED_HOSTS</code> di Next + Convex, lalu wiring
        <code> lib/convex-http.ts</code> untuk mengaktifkan token dan tool call.
      </div>
    </SettingsSection>
  )
}
