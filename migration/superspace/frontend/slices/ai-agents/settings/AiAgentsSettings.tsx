"use client"

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"

export function AiAgentsGeneralSettings() {
  return (
    <SettingsSection title="General" description="Pengaturan dasar untuk AI Agents">
      <div className="text-sm text-muted-foreground">
        Scaffold non-fungsional — dashboard antrean task + jejak run bersifat statis.
        Wiring convex workspace-scoped (provider/SDK, retry, schedule) akan hadir saat
        backend diaktifkan.
      </div>
    </SettingsSection>
  )
}
