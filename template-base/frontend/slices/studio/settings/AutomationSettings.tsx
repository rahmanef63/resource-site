"use client"

/**
 * Automation Feature Settings Components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAutomationSettingsStorage } from "./useAutomationSettings"
import {
    SettingsSection,
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"

export function AutomationGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useAutomationSettingsStorage()

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
                            <CardDescription>Configure automation defaults</CardDescription>
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
                        description="Automation section shown on load"
                        value={settings.defaultView}
                        onValueChange={(v) => updateSetting("defaultView", v as typeof settings.defaultView)}
                        options={[
                            { value: "workflows", label: "Workflows" },
                            { value: "triggers", label: "Triggers" },
                            { value: "history", label: "History" },
                        ]}
                    />

                    <SettingsToggle
                        id="enable"
                        label="Enable Automations"
                        description="Run automations when triggered"
                        checked={settings.enableAutomations}
                        onCheckedChange={(v) => updateSetting("enableAutomations", v)}
                    />

                    <SettingsSelect
                        id="concurrent"
                        label="Max Concurrent"
                        description="Maximum automations running at once"
                        value={String(settings.maxConcurrent)}
                        onValueChange={(v) => updateSetting("maxConcurrent", Number(v) as typeof settings.maxConcurrent)}
                        options={[
                            { value: "5", label: "5" },
                            { value: "10", label: "10" },
                            { value: "25", label: "25" },
                            { value: "50", label: "50" },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function AutomationExecutionSettings() {
    const { settings, updateSetting, isLoaded } = useAutomationSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Execution</CardTitle>
                    <CardDescription>Configure execution behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSection title="Retry Settings" description="Handle failed automations">
                        <SettingsToggle
                            id="retry"
                            label="Retry on Failure"
                            description="Automatically retry failed steps"
                            checked={settings.retryOnFailure}
                            onCheckedChange={(v) => updateSetting("retryOnFailure", v)}
                        />

                        <SettingsSelect
                            id="max-retries"
                            label="Max Retries"
                            description="Number of retry attempts"
                            value={String(settings.maxRetries)}
                            onValueChange={(v) => updateSetting("maxRetries", Number(v) as typeof settings.maxRetries)}
                            options={[
                                { value: "1", label: "1 retry" },
                                { value: "3", label: "3 retries" },
                                { value: "5", label: "5 retries" },
                            ]}
                            disabled={!settings.retryOnFailure}
                        />

                        <SettingsSelect
                            id="retry-delay"
                            label="Retry Delay"
                            description="Wait time between retries"
                            value={String(settings.retryDelay)}
                            onValueChange={(v) => updateSetting("retryDelay", Number(v) as typeof settings.retryDelay)}
                            options={[
                                { value: "60", label: "1 minute" },
                                { value: "300", label: "5 minutes" },
                                { value: "900", label: "15 minutes" },
                            ]}
                            disabled={!settings.retryOnFailure}
                        />
                    </SettingsSection>

                    <Separator />

                    <SettingsSelect
                        id="timeout"
                        label="Timeout"
                        description="Max execution time per step"
                        value={String(settings.timeout)}
                        onValueChange={(v) => updateSetting("timeout", Number(v) as typeof settings.timeout)}
                        options={[
                            { value: "30", label: "30 seconds" },
                            { value: "60", label: "1 minute" },
                            { value: "300", label: "5 minutes" },
                            { value: "600", label: "10 minutes" },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function AutomationNotificationSettings() {
    const { settings, updateSetting, isLoaded } = useAutomationSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure automation notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="success"
                        label="Notify on Success"
                        description="Get notified when automations complete"
                        checked={settings.notifyOnSuccess}
                        onCheckedChange={(v) => updateSetting("notifyOnSuccess", v)}
                    />

                    <SettingsToggle
                        id="failure"
                        label="Notify on Failure"
                        description="Get notified when automations fail"
                        checked={settings.notifyOnFailure}
                        onCheckedChange={(v) => updateSetting("notifyOnFailure", v)}
                    />

                    <SettingsToggle
                        id="complete"
                        label="Notify on Complete"
                        description="Get notified when any automation ends"
                        checked={settings.notifyOnComplete}
                        onCheckedChange={(v) => updateSetting("notifyOnComplete", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function AutomationLoggingSettings() {
    const { settings, updateSetting, isLoaded } = useAutomationSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Logging</CardTitle>
                    <CardDescription>Configure logging and history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="log-level"
                        label="Log Level"
                        description="Amount of detail to log"
                        value={settings.logLevel}
                        onValueChange={(v) => updateSetting("logLevel", v as typeof settings.logLevel)}
                        options={[
                            { value: "minimal", label: "Minimal" },
                            { value: "normal", label: "Normal" },
                            { value: "verbose", label: "Verbose" },
                        ]}
                    />

                    <SettingsSelect
                        id="retain"
                        label="Log Retention"
                        description="How long to keep logs"
                        value={String(settings.retainLogs)}
                        onValueChange={(v) => updateSetting("retainLogs", Number(v) as typeof settings.retainLogs)}
                        options={[
                            { value: "7", label: "7 days" },
                            { value: "30", label: "30 days" },
                            { value: "90", label: "90 days" },
                        ]}
                    />

                    <SettingsToggle
                        id="debug"
                        label="Show Debug Info"
                        description="Display detailed debug information"
                        checked={settings.showDebugInfo}
                        onCheckedChange={(v) => updateSetting("showDebugInfo", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const AutomationSettings = AutomationGeneralSettings
