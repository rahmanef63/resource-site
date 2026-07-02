"use client"

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"

export function AiChatGeneralSettings() {
  return (
    <SettingsSection title="General" description="Pengaturan dasar untuk AI Chat">
      <div className="text-sm text-muted-foreground">
        Workbench scaffold — backend AI belum tersambung di build ini. Sambungkan
        aksi penyedia model (mis. api.features.aiRouter.action.callModel) agar
        balasan menjadi sungguhan.
      </div>
    </SettingsSection>
  )
}
