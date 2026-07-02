"use client"

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"

export function AiRouterGeneralSettings() {
  return (
    <SettingsSection title="General" description="Pengaturan dasar untuk AI Router">
      <div className="text-sm text-muted-foreground">
        Konfigurasi proxy provider untuk akses LLM ber-tier — nano untuk
        klasifikasi, mid untuk chat, flagship untuk reasoning. Scaffold
        non-fungsional: routing live diaktifkan saat convex action di-wire dengan
        ensureUser + requirePermission + audit log.
      </div>
    </SettingsSection>
  )
}
