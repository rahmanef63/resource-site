"use client"

/**
 * AI General Settings
 * Configure AI assistant preferences and chat history
 */

import { useMemo } from "react"
import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import { SettingsSelect } from "@/frontend/shared/settings/primitives/SettingsSelect"
import {
  useAISettingsStorage,
  AI_PROVIDERS,
  getAIProvider,
  getProviderModels,
} from "./useAISettings"
import { AlertCircle } from "lucide-react"

export function AIGeneralSettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()

  // Get available providers (those with API keys configured)
  const configuredProviders = useMemo(() => {
    const keys = settings.apiKeys || []
    return keys.filter(k => k.isEnabled).map(k => getAIProvider(k.providerId)).filter(Boolean)
  }, [settings.apiKeys])

  // Get models for selected provider
  const availableModels = useMemo(() => {
    return getProviderModels(settings.defaultProvider)
  }, [settings.defaultProvider])

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  // Build provider options
  const providerOptions = configuredProviders.length > 0
    ? configuredProviders.map(p => ({ value: p!.id, label: p!.name }))
    : AI_PROVIDERS.slice(0, 6).map(p => ({ value: p.id, label: p.name }))

  // Build model options
  const modelOptions = availableModels.length > 0
    ? availableModels.map(m => ({ value: m.id, label: m.name }))
    : [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini" },
        { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
      ]

  return (
    <div className="space-y-6">
      <SettingsSection
        title="AI Assistant"
        description="Configure your AI assistant preferences"
      >
        <SettingsToggle
          label="Enable AI Assistant"
          description="Use AI to help with tasks and conversations"
          checked={settings.aiEnabled}
          onCheckedChange={(checked) => updateSetting("aiEnabled", checked)}
        />

        {configuredProviders.length === 0 && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-600">No API keys configured</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Go to the <strong>API Keys</strong> section to add your provider API keys
                </p>
              </div>
            </div>
          </div>
        )}

        <SettingsSelect
          label="Default Provider"
          description="Choose which AI provider to use"
          value={settings.defaultProvider}
          onValueChange={(value) => {
            updateSetting("defaultProvider", value)
            // Reset model when provider changes
            const models = getProviderModels(value)
            if (models.length > 0) {
              updateSetting("defaultModel", models[0].id)
            }
          }}
          options={providerOptions}
        />

        <SettingsSelect
          label="Default Model"
          description="Choose which AI model to use"
          value={settings.defaultModel}
          onValueChange={(value) => updateSetting("defaultModel", value)}
          options={modelOptions}
        />

        <SettingsToggle
          label="Stream Responses"
          description="Show AI responses as they are generated"
          checked={settings.streamResponses}
          onCheckedChange={(checked) => updateSetting("streamResponses", checked)}
        />
      </SettingsSection>

      <SettingsSection
        title="Chat History"
        description="Manage AI conversation history"
      >
        <SettingsToggle
          label="Save Chat History"
          description="Keep a record of AI conversations"
          checked={settings.saveHistory}
          onCheckedChange={(checked) => updateSetting("saveHistory", checked)}
        />

        <SettingsSelect
          label="History Retention"
          description="How long to keep AI chat history"
          value={settings.historyRetentionDays}
          onValueChange={(value) => updateSetting("historyRetentionDays", value as typeof settings.historyRetentionDays)}
          options={[
            { value: "7", label: "7 days" },
            { value: "30", label: "30 days" },
            { value: "90", label: "90 days" },
            { value: "365", label: "1 year" },
            { value: "forever", label: "Forever" },
          ]}
        />
      </SettingsSection>
    </div>
  )
}
