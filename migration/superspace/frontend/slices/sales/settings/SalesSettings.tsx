"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect } from "@/frontend/shared/settings/primitives"
import { useState } from "react"

export function SalesSettings() {
  const [settings, setSettings] = useState({
    defaultCurrency: "USD",
    salesTaxRate: "0",
    quoteValidity: "30days",
    autoNumbering: true,
    showDiscountColumn: true,
    requireApproval: false,
  })

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Currency</CardTitle>
          <CardDescription>Configure pricing defaults</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Default Currency"
            description="Currency for new quotes and invoices"
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
            label="Default Tax Rate"
            description="Applied to new line items"
            value={settings.salesTaxRate}
            onValueChange={(v) => updateSetting("salesTaxRate", v)}
            options={[
              { value: "0", label: "No Tax (0%)" },
              { value: "5", label: "5%" },
              { value: "10", label: "10%" },
              { value: "11", label: "11% (PPN Indonesia)" },
              { value: "20", label: "20% (VAT UK)" },
            ]}
          />
          <SettingsToggle
            label="Show Discount Column"
            description="Display discount column in quotes"
            checked={settings.showDiscountColumn}
            onCheckedChange={(v) => updateSetting("showDiscountColumn", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quotes & Orders</CardTitle>
          <CardDescription>Configure quote and order settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Quote Validity"
            description="Default expiration for new quotes"
            value={settings.quoteValidity}
            onValueChange={(v) => updateSetting("quoteValidity", v)}
            options={[
              { value: "7days", label: "7 Days" },
              { value: "14days", label: "14 Days" },
              { value: "30days", label: "30 Days" },
              { value: "60days", label: "60 Days" },
            ]}
          />
          <SettingsToggle
            label="Auto Numbering"
            description="Automatically generate quote/order numbers"
            checked={settings.autoNumbering}
            onCheckedChange={(v) => updateSetting("autoNumbering", v)}
          />
          <SettingsToggle
            label="Require Approval"
            description="Large orders require manager approval"
            checked={settings.requireApproval}
            onCheckedChange={(v) => updateSetting("requireApproval", v)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
