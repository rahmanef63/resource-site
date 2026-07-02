"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect } from "@/frontend/shared/settings/primitives"
import { useState } from "react"

export function PlatformAdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowSignups: true,
    defaultPlan: "free",
    requireEmailVerification: true,
    sessionTimeout: "24h",
    enableAuditLog: true,
  })

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Access</CardTitle>
          <CardDescription>Control platform access and sign-ups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Maintenance Mode"
            description="Temporarily disable access to the platform"
            checked={settings.maintenanceMode}
            onCheckedChange={(v) => updateSetting("maintenanceMode", v)}
          />
          <SettingsToggle
            label="Allow New Sign-ups"
            description="Allow new users to create accounts"
            checked={settings.allowSignups}
            onCheckedChange={(v) => updateSetting("allowSignups", v)}
          />
          <SettingsToggle
            label="Require Email Verification"
            description="Users must verify email before accessing"
            checked={settings.requireEmailVerification}
            onCheckedChange={(v) => updateSetting("requireEmailVerification", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Configure platform security options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Session Timeout"
            description="How long before inactive sessions expire"
            value={settings.sessionTimeout}
            onValueChange={(v) => updateSetting("sessionTimeout", v)}
            options={[
              { value: "1h", label: "1 Hour" },
              { value: "8h", label: "8 Hours" },
              { value: "24h", label: "24 Hours" },
              { value: "7d", label: "7 Days" },
            ]}
          />
          <SettingsToggle
            label="Enable Audit Log"
            description="Log all admin actions for compliance"
            checked={settings.enableAuditLog}
            onCheckedChange={(v) => updateSetting("enableAuditLog", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
          <CardDescription>Defaults for new workspaces</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Default Plan"
            description="Plan assigned to new workspaces"
            value={settings.defaultPlan}
            onValueChange={(v) => updateSetting("defaultPlan", v)}
            options={[
              { value: "free", label: "Free" },
              { value: "starter", label: "Starter" },
              { value: "pro", label: "Pro" },
              { value: "enterprise", label: "Enterprise" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
