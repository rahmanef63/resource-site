"use client"

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"

export function NotionGeneralSettings() {
  return (
    <SettingsSection title="General" description="Pengaturan dasar untuk Notion">
      <div className="text-sm text-muted-foreground">
        Editor local-first — konten halaman disimpan di browser ini per workspace.
        Sinkronisasi multi-user akan hadir saat backend workspace-scoped diaktifkan.
      </div>
    </SettingsSection>
  )
}
