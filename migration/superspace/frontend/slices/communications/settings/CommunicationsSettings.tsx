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
import { useCommunicationsSettingsStorage } from "./useCommunicationsSettings"

export function CommunicationsSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useCommunicationsSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Channels</CardTitle>
                            <CardDescription>Enable the communication channels you want to use</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>Reset</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="default-channel"
                        label="Default Send Channel"
                        description="Channel used when no preference is specified"
                        value={settings.defaultSendChannel}
                        onValueChange={(v) => updateSetting("defaultSendChannel", v as typeof settings.defaultSendChannel)}
                        options={[
                            { value: "email", label: "Email" },
                            { value: "sms", label: "SMS" },
                            { value: "push", label: "Push Notification" },
                            { value: "in-app", label: "In-App" },
                        ]}
                    />

                    <Separator />

                    <SettingsSection title="Active Channels" description="Which channels are enabled">
                        <SettingsToggle
                            id="email-enabled"
                            label="Email"
                            description="Send messages via email"
                            checked={settings.emailEnabled}
                            onCheckedChange={(v) => updateSetting("emailEnabled", v)}
                        />

                        <SettingsToggle
                            id="sms-enabled"
                            label="SMS"
                            description="Send messages via SMS"
                            checked={settings.smsEnabled}
                            onCheckedChange={(v) => updateSetting("smsEnabled", v)}
                        />

                        <SettingsToggle
                            id="push-enabled"
                            label="Push Notifications"
                            description="Send browser/mobile push notifications"
                            checked={settings.pushEnabled}
                            onCheckedChange={(v) => updateSetting("pushEnabled", v)}
                        />

                        <SettingsToggle
                            id="in-app-enabled"
                            label="In-App Notifications"
                            description="Show notifications inside the app"
                            checked={settings.inAppEnabled}
                            onCheckedChange={(v) => updateSetting("inAppEnabled", v)}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Delivery</CardTitle>
                    <CardDescription>Message delivery and retry behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="retry-failed"
                        label="Retry Failed Messages"
                        description="Automatically retry when message delivery fails"
                        checked={settings.retryFailedMessages}
                        onCheckedChange={(v) => updateSetting("retryFailedMessages", v)}
                    />

                    <SettingsSlider
                        id="retry-attempts"
                        label={`Max Retry Attempts (${settings.retryAttempts})`}
                        description="How many times to retry a failed message"
                        value={settings.retryAttempts}
                        onValueChange={(v: number[]) => updateSetting("retryAttempts", v[0])}
                        min={1}
                        max={10}
                        step={1}
                        disabled={!settings.retryFailedMessages}
                    />

                    <Separator />

                    <SettingsSlider
                        id="archive-after"
                        label={`Archive After (${settings.archiveAfterDays} days)`}
                        description="Automatically archive old messages"
                        value={settings.archiveAfterDays}
                        onValueChange={(v: number[]) => updateSetting("archiveAfterDays", v[0])}
                        min={7}
                        max={365}
                        step={7}
                    />

                    <Separator />

                    <SettingsToggle
                        id="notify-delivery"
                        label="Notify on Delivery"
                        description="Alert when a message is successfully delivered"
                        checked={settings.notifyOnDelivery}
                        onCheckedChange={(v) => updateSetting("notifyOnDelivery", v)}
                    />

                    <SettingsToggle
                        id="notify-failure"
                        label="Notify on Failure"
                        description="Alert when a message permanently fails to deliver"
                        checked={settings.notifyOnFailure}
                        onCheckedChange={(v) => updateSetting("notifyOnFailure", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
