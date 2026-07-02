"use client"

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"

export function AiStudioGeneralSettings() {
  return (
    <SettingsSection title="General" description="Pengaturan dasar untuk AI Studio">
      <div className="text-sm text-muted-foreground">
        Kanvas generasi masih scaffold — panggilan provider AI belum aktif.
        Konfigurasi model, variasi, dan riwayat versi akan hadir saat backend
        generasi (aiRouter) diwiring dengan RBAC dan audit.
      </div>
    </SettingsSection>
  )
}
