"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect } from "@/frontend/shared/settings/primitives"
import { useState } from "react"

export function ContentSettings() {
  const [settings, setSettings] = useState({
    defaultEditor: "rich",
    autoSave: true,
    autoSaveInterval: "30s",
    showWordCount: true,
    spellCheck: true,
    defaultVisibility: "draft",
  })

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editor Settings</CardTitle>
          <CardDescription>Configure content editor preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Default Editor"
            description="Editor type for new content"
            value={settings.defaultEditor}
            onValueChange={(v) => updateSetting("defaultEditor", v)}
            options={[
              { value: "rich", label: "Rich Text Editor" },
              { value: "markdown", label: "Markdown Editor" },
              { value: "code", label: "Code Editor" },
            ]}
          />
          <SettingsSelect
            label="Auto-Save Interval"
            description="How often to save drafts automatically"
            value={settings.autoSaveInterval}
            onValueChange={(v) => updateSetting("autoSaveInterval", v)}
            options={[
              { value: "10s", label: "Every 10 seconds" },
              { value: "30s", label: "Every 30 seconds" },
              { value: "1min", label: "Every minute" },
              { value: "5min", label: "Every 5 minutes" },
            ]}
          />
          <SettingsToggle
            label="Auto-Save"
            description="Automatically save content while editing"
            checked={settings.autoSave}
            onCheckedChange={(v) => updateSetting("autoSave", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
          <CardDescription>Customize editor display features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Show Word Count"
            description="Display word count in editor"
            checked={settings.showWordCount}
            onCheckedChange={(v) => updateSetting("showWordCount", v)}
          />
          <SettingsToggle
            label="Spell Check"
            description="Enable spell checking in editor"
            checked={settings.spellCheck}
            onCheckedChange={(v) => updateSetting("spellCheck", v)}
          />
          <SettingsSelect
            label="Default Visibility"
            description="Default publish state for new content"
            value={settings.defaultVisibility}
            onValueChange={(v) => updateSetting("defaultVisibility", v)}
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "private", label: "Private" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
