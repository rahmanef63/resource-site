"use client"

import { useContactSettingsStorage } from "./useContactSettings"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ContactSettings() {
    const { settings, updateSettings } = useContactSettingsStorage()

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure general preferences for contact</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications for updates
                            </p>
                        </div>
                        <Switch
                            checked={settings.notificationsEnabled}
                            onCheckedChange={(checked) =>
                                updateSettings({ notificationsEnabled: checked })
                            }
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto Save</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically save changes
                            </p>
                        </div>
                        <Switch
                            checked={settings.autoSave}
                            onCheckedChange={(checked) =>
                                updateSettings({ autoSave: checked })
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
