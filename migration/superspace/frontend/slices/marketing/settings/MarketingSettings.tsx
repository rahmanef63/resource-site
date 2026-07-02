"use client"

/**
 * Marketing Feature Settings Components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMarketingSettingsStorage } from "./useMarketingSettings"
import {
    SettingsToggle,
    SettingsSelect,
} from "@/frontend/shared/settings/primitives"

export function MarketingGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useMarketingSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Configure marketing defaults</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="view"
                        label="Default View"
                        description="Marketing section shown on load"
                        value={settings.defaultView}
                        onValueChange={(v) => updateSetting("defaultView", v as typeof settings.defaultView)}
                        options={[
                            { value: "campaigns", label: "Campaigns" },
                            { value: "analytics", label: "Analytics" },
                            { value: "audience", label: "Audience" },
                        ]}
                    />

                    <SettingsSelect
                        id="timezone"
                        label="Timezone"
                        description="For scheduling campaigns"
                        value={settings.timezone}
                        onValueChange={(v) => updateSetting("timezone", v as typeof settings.timezone)}
                        options={[
                            { value: "local", label: "Local Time" },
                            { value: "utc", label: "UTC" },
                        ]}
                    />

                    <SettingsSelect
                        id="currency"
                        label="Currency"
                        description="For budget and reporting"
                        value={settings.currency}
                        onValueChange={(v) => updateSetting("currency", v as typeof settings.currency)}
                        options={[
                            { value: "USD", label: "USD ($)" },
                            { value: "EUR", label: "EUR (€)" },
                            { value: "GBP", label: "GBP (£)" },
                            { value: "custom", label: "Custom" },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function MarketingCampaignSettings() {
    const { settings, updateSetting, isLoaded } = useMarketingSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Campaign Settings</CardTitle>
                    <CardDescription>Configure campaign behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="status"
                        label="Default Campaign Status"
                        description="Status for new campaigns"
                        value={settings.defaultCampaignStatus}
                        onValueChange={(v) => updateSetting("defaultCampaignStatus", v as typeof settings.defaultCampaignStatus)}
                        options={[
                            { value: "draft", label: "Draft" },
                            { value: "scheduled", label: "Scheduled" },
                            { value: "active", label: "Active" },
                        ]}
                    />

                    <SettingsToggle
                        id="approval"
                        label="Require Approval"
                        description="Campaigns need approval before sending"
                        checked={settings.requireApproval}
                        onCheckedChange={(v) => updateSetting("requireApproval", v)}
                    />

                    <Separator />

                    <SettingsToggle
                        id="opens"
                        label="Track Opens"
                        description="Monitor email open rates"
                        checked={settings.trackOpens}
                        onCheckedChange={(v) => updateSetting("trackOpens", v)}
                    />

                    <SettingsToggle
                        id="clicks"
                        label="Track Clicks"
                        description="Monitor link click rates"
                        checked={settings.trackClicks}
                        onCheckedChange={(v) => updateSetting("trackClicks", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function MarketingEmailSettings() {
    const { settings, updateSetting, isLoaded } = useMarketingSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>Configure email defaults</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="unsubscribe"
                        label="Unsubscribe Link"
                        description="Include unsubscribe link in emails"
                        checked={settings.unsubscribeLink}
                        onCheckedChange={(v) => updateSetting("unsubscribeLink", v)}
                    />

                    <SettingsToggle
                        id="footer"
                        label="Footer Text"
                        description="Include company footer in emails"
                        checked={settings.footerText}
                        onCheckedChange={(v) => updateSetting("footerText", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function MarketingAnalyticsSettings() {
    const { settings, updateSetting, isLoaded } = useMarketingSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>Configure marketing analytics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="roi"
                        label="Show ROI"
                        description="Display return on investment metrics"
                        checked={settings.showROI}
                        onCheckedChange={(v) => updateSetting("showROI", v)}
                    />

                    <SettingsToggle
                        id="compare"
                        label="Compare to Average"
                        description="Show comparison to industry averages"
                        checked={settings.compareToAverage}
                        onCheckedChange={(v) => updateSetting("compareToAverage", v)}
                    />

                    <SettingsToggle
                        id="realtime"
                        label="Real-Time Updates"
                        description="Live data updates"
                        checked={settings.realTimeUpdates}
                        onCheckedChange={(v) => updateSetting("realTimeUpdates", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const MarketingSettings = MarketingGeneralSettings
