"use client"

/**
 * AI Privacy Settings
 * Control data sharing and processing preferences
 */

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import { useAISettingsStorage } from "./useAISettings"

export function AIPrivacySettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Data Sharing"
        description="Control how your data is used"
      >
        <SettingsToggle
          label="Share Data for Improvement"
          description="Help improve AI by sharing anonymized usage data"
          checked={settings.shareDataForImprovement}
          onCheckedChange={(checked) => updateSetting("shareDataForImprovement", checked)}
        />

        <SettingsToggle
          label="Anonymize Data"
          description="Remove personal identifiers from shared data"
          checked={settings.anonymizeData}
          onCheckedChange={(checked) => updateSetting("anonymizeData", checked)}
        />

        <SettingsToggle
          label="Local Processing Only"
          description="Process AI requests locally when possible"
          checked={settings.localProcessingOnly}
          onCheckedChange={(checked) => updateSetting("localProcessingOnly", checked)}
        />
      </SettingsSection>
    </div>
  )
}
