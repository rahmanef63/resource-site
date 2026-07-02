"use client"

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"

export function AiAdminGeneralSettings() {
  return (
    <SettingsSection title="General" description="Pengaturan dasar untuk AI Admin">
      <div className="text-sm text-muted-foreground">
        Konsol operator untuk seluruh AI stack — provider, model, instruksi,
        skill, tool, dan definisi agent. Saat ini scaffold non-fungsional;
        CRUD ber-RBAC atas registry aiRouter menyusul.
      </div>
    </SettingsSection>
  )
}
