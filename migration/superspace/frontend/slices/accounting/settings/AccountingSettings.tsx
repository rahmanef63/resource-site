"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect } from "@/frontend/shared/settings/primitives"
import { useState } from "react"

export function AccountingSettings() {
  const [settings, setSettings] = useState({
    defaultCurrency: "USD",
    fiscalYearStart: "january",
    autoReconcile: true,
    showTaxColumn: true,
    roundingMode: "nearest",
    requireApproval: false,
  })

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure default accounting preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Default Currency"
            description="Primary currency for transactions"
            value={settings.defaultCurrency}
            onValueChange={(v) => updateSetting("defaultCurrency", v)}
            options={[
              { value: "USD", label: "USD - US Dollar" },
              { value: "EUR", label: "EUR - Euro" },
              { value: "GBP", label: "GBP - British Pound" },
              { value: "IDR", label: "IDR - Indonesian Rupiah" },
            ]}
          />
          <SettingsSelect
            label="Fiscal Year Start"
            description="When your fiscal year begins"
            value={settings.fiscalYearStart}
            onValueChange={(v) => updateSetting("fiscalYearStart", v)}
            options={[
              { value: "january", label: "January" },
              { value: "april", label: "April" },
              { value: "july", label: "July" },
              { value: "october", label: "October" },
            ]}
          />
          <SettingsSelect
            label="Rounding Mode"
            description="How to round calculated values"
            value={settings.roundingMode}
            onValueChange={(v) => updateSetting("roundingMode", v)}
            options={[
              { value: "nearest", label: "Round to Nearest" },
              { value: "up", label: "Always Round Up" },
              { value: "down", label: "Always Round Down" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
          <CardDescription>Customize how accounting data is displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Show Tax Column"
            description="Display tax amounts in transaction lists"
            checked={settings.showTaxColumn}
            onCheckedChange={(v) => updateSetting("showTaxColumn", v)}
          />
          <SettingsToggle
            label="Auto-Reconcile"
            description="Automatically match transactions when possible"
            checked={settings.autoReconcile}
            onCheckedChange={(v) => updateSetting("autoReconcile", v)}
          />
          <SettingsToggle
            label="Require Approval"
            description="Require approval for transactions above threshold"
            checked={settings.requireApproval}
            onCheckedChange={(v) => updateSetting("requireApproval", v)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
