"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    SettingsSection,
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"
import { useIntegrationsSettingsStorage } from "./useIntegrationsSettings"

export function IntegrationsConnectionSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useIntegrationsSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Connection</CardTitle>
                            <CardDescription>Configure API connection behavior</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>Reset</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSlider
                        id="api-timeout"
                        label={`API Timeout (${settings.apiTimeoutSeconds}s)`}
                        description="Seconds to wait before timing out a request"
                        value={settings.apiTimeoutSeconds}
                        onValueChange={(v: number[]) => updateSetting("apiTimeoutSeconds", v[0])}
                        min={5}
                        max={120}
                        step={5}
                    />

                    <SettingsSlider
                        id="retry-attempts"
                        label={`Retry Attempts (${settings.retryAttempts})`}
                        description="How many times to retry failed requests"
                        value={settings.retryAttempts}
                        onValueChange={(v: number[]) => updateSetting("retryAttempts", v[0])}
                        min={0}
                        max={5}
                        step={1}
                    />

                    <Separator />

                    <SettingsToggle
                        id="auto-refresh-tokens"
                        label="Auto-Refresh Tokens"
                        description="Automatically renew OAuth tokens before expiry"
                        checked={settings.autoRefreshTokens}
                        onCheckedChange={(v) => updateSetting("autoRefreshTokens", v)}
                    />

                    <SettingsToggle
                        id="webhook-enabled"
                        label="Enable Webhooks"
                        description="Allow integrations to send real-time events"
                        checked={settings.webhookEnabled}
                        onCheckedChange={(v) => updateSetting("webhookEnabled", v)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Developer</CardTitle>
                    <CardDescription>Advanced settings for debugging</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="sandbox-mode"
                        label="Sandbox Mode"
                        description="Use test/sandbox endpoints for all integrations"
                        checked={settings.sandboxMode}
                        onCheckedChange={(v) => updateSetting("sandboxMode", v)}
                    />

                    <SettingsToggle
                        id="log-api-calls"
                        label="Log API Calls"
                        description="Record all API requests in the audit log"
                        checked={settings.logApiCalls}
                        onCheckedChange={(v) => updateSetting("logApiCalls", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function IntegrationsNotificationSettings() {
    const { settings, updateSetting, isLoaded } = useIntegrationsSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Integration event alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSection title="Alert Events" description="When to send alerts">
                        <SettingsToggle
                            id="notify-disconnect"
                            label="On Disconnection"
                            description="Alert when an integration loses connection"
                            checked={settings.notifyOnDisconnect}
                            onCheckedChange={(v) => updateSetting("notifyOnDisconnect", v)}
                        />

                        <SettingsToggle
                            id="notify-error"
                            label="On API Error"
                            description="Alert when an integration returns errors"
                            checked={settings.notifyOnError}
                            onCheckedChange={(v) => updateSetting("notifyOnError", v)}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export const IntegrationsSettings = IntegrationsConnectionSettings
export default IntegrationsSettings
