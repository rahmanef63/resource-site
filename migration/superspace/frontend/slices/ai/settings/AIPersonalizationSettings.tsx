"use client"

/**
 * AI Personalization Settings
 * Customize AI personality and smart suggestions
 */

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import { SettingsSelect } from "@/frontend/shared/settings/primitives/SettingsSelect"
import { useAISettingsStorage } from "./useAISettings"

export function AIPersonalizationSettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Personality"
        description="Customize AI response style"
      >
        <SettingsToggle
          label="Use Custom Personality"
          description="Enable personalized AI response style"
          checked={settings.usePersonality}
          onCheckedChange={(checked) => updateSetting("usePersonality", checked)}
        />

        <SettingsSelect
          label="Response Tone"
          description="How the AI should communicate"
          value={settings.personalityTone}
          onValueChange={(value) => updateSetting("personalityTone", value as typeof settings.personalityTone)}
          options={[
            { value: "professional", label: "Professional" },
            { value: "Contactly", label: "Contactly" },
            { value: "casual", label: "Casual" },
            { value: "formal", label: "Formal" },
          ]}
        />
      </SettingsSection>

      <SettingsSection
        title="Smart Suggestions"
        description="AI-powered suggestions and learning"
      >
        <SettingsToggle
          label="Auto Suggestions"
          description="Show AI suggestions while typing"
          checked={settings.autoSuggest}
          onCheckedChange={(checked) => updateSetting("autoSuggest", checked)}
        />

        <SettingsSelect
          label="Suggestion Frequency"
          description="How often to show suggestions"
          value={settings.suggestFrequency}
          onValueChange={(value) => updateSetting("suggestFrequency", value as typeof settings.suggestFrequency)}
          options={[
            { value: "always", label: "Always" },
            { value: "sometimes", label: "Sometimes" },
            { value: "rarely", label: "Rarely" },
          ]}
        />

        <SettingsToggle
          label="Learn from History"
          description="Use past conversations to improve responses"
          checked={settings.learnFromHistory}
          onCheckedChange={(checked) => updateSetting("learnFromHistory", checked)}
        />
      </SettingsSection>
    </div>
  )
}
