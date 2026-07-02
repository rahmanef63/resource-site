"use client"

/**
 * AI Behavior Settings
 * Fine-tune response generation and context handling
 */

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { SettingsSelect } from "@/frontend/shared/settings/primitives/SettingsSelect"
import { SettingsSlider } from "@/frontend/shared/settings/primitives/SettingsSlider"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import { useAISettingsStorage } from "./useAISettings"

export function AIBehaviorSettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Response Generation"
        description="Fine-tune how the AI responds"
      >
        <SettingsSlider
          label="Creativity (Temperature)"
          description="Higher values make responses more creative, lower values more focused"
          value={[settings.temperature * 100]}
          onValueChange={(value) => updateSetting("temperature", value[0] / 100)}
          max={100}
          step={5}
          showValue
        />

        <SettingsSelect
          label="Max Response Length"
          description="Maximum tokens in AI responses"
          value={settings.maxTokens}
          onValueChange={(value) => updateSetting("maxTokens", value as typeof settings.maxTokens)}
          options={[
            { value: "512", label: "Short (512)" },
            { value: "1024", label: "Medium (1024)" },
            { value: "2048", label: "Long (2048)" },
            { value: "4096", label: "Very Long (4096)" },
            { value: "8192", label: "Maximum (8192)" },
          ]}
        />
      </SettingsSection>

      <SettingsSection
        title="Context"
        description="How the AI uses conversation context"
      >
        <SettingsToggle
          label="Include Context"
          description="Include previous messages for context"
          checked={settings.contextWindow}
          onCheckedChange={(checked) => updateSetting("contextWindow", checked)}
        />

        <SettingsSlider
          label="Context Messages"
          description="Number of previous messages to include"
          value={[settings.contextMessages]}
          onValueChange={(value) => updateSetting("contextMessages", value[0])}
          max={50}
          min={1}
          step={1}
          showValue
        />
      </SettingsSection>
    </div>
  )
}
