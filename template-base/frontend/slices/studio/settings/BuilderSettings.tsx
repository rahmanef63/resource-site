"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBuilderSettingsStorage } from "./useBuilderSettings"
import {
    SettingsSection,
    SettingsToggle,
} from "@/frontend/shared/settings/primitives"

export function BuilderSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useBuilderSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Builder Settings</CardTitle>
                            <CardDescription>Configure the visual builder behavior</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={resetSettings}>
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <SettingsSection title="General">
                        <SettingsToggle
                            label="Auto-save"
                            description="Automatically save canvas changes as you build"
                            checked={settings.autoSave}
                            onCheckedChange={(v) => updateSetting('autoSave', v)}
                        />
                        <SettingsToggle
                            label="Notifications"
                            description="Show notifications for builder events (save, export, error)"
                            checked={settings.notificationsEnabled}
                            onCheckedChange={(v) => updateSetting('notificationsEnabled', v)}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export default BuilderSettings
