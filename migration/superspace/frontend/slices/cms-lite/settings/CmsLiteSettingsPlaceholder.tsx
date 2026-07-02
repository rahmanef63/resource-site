"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect } from "@/frontend/shared/settings/primitives"
import { useState } from "react"

export function CmsLiteSettingsPlaceholder() {
  const [settings, setSettings] = useState({
    defaultTemplate: "blank",
    enableSEO: true,
    enableComments: false,
    publishWorkflow: "immediate",
    imageOptimization: true,
    cacheStrategy: "default",
  })

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Defaults</CardTitle>
          <CardDescription>Configure default content settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Default Template"
            description="Template for new pages"
            value={settings.defaultTemplate}
            onValueChange={(v) => updateSetting("defaultTemplate", v)}
            options={[
              { value: "blank", label: "Blank Page" },
              { value: "blog", label: "Blog Post" },
              { value: "landing", label: "Landing Page" },
              { value: "docs", label: "Documentation" },
            ]}
          />
          <SettingsSelect
            label="Publish Workflow"
            description="How content gets published"
            value={settings.publishWorkflow}
            onValueChange={(v) => updateSetting("publishWorkflow", v)}
            options={[
              { value: "immediate", label: "Publish Immediately" },
              { value: "scheduled", label: "Schedule for Later" },
              { value: "approval", label: "Require Approval" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Enable or disable CMS features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Enable SEO Fields"
            description="Show SEO meta fields on pages"
            checked={settings.enableSEO}
            onCheckedChange={(v) => updateSetting("enableSEO", v)}
          />
          <SettingsToggle
            label="Enable Comments"
            description="Allow comments on published pages"
            checked={settings.enableComments}
            onCheckedChange={(v) => updateSetting("enableComments", v)}
          />
          <SettingsToggle
            label="Image Optimization"
            description="Automatically optimize uploaded images"
            checked={settings.imageOptimization}
            onCheckedChange={(v) => updateSetting("imageOptimization", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
          <CardDescription>Configure caching and performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Cache Strategy"
            description="How pages are cached"
            value={settings.cacheStrategy}
            onValueChange={(v) => updateSetting("cacheStrategy", v)}
            options={[
              { value: "none", label: "No Caching" },
              { value: "default", label: "Default (1 hour)" },
              { value: "aggressive", label: "Aggressive (24 hours)" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
