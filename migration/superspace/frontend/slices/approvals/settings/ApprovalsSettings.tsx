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
import { useApprovalsSettingsStorage } from "./useApprovalsSettings"

export function ApprovalsGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useApprovalsSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Approval Workflow</CardTitle>
                            <CardDescription>Configure how approvals are processed</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>Reset</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="approval-mode"
                        label="Approval Mode"
                        description="How approvers must respond"
                        value={settings.approvalMode}
                        onValueChange={(v) => updateSetting("approvalMode", v as typeof settings.approvalMode)}
                        options={[
                            { value: "sequential", label: "Sequential — one at a time" },
                            { value: "parallel", label: "Parallel — all at once" },
                            { value: "any", label: "Any — first approval wins" },
                        ]}
                    />

                    <SettingsSlider
                        id="required-approvers"
                        label="Required Approvers"
                        description="Minimum number of approvers needed"
                        value={settings.requiredApprovers}
                        onValueChange={(v: number[]) => updateSetting("requiredApprovers", v[0])}
                        min={1}
                        max={10}
                        step={1}
                    />

                    <Separator />

                    <SettingsSlider
                        id="escalation-timeout"
                        label="Escalation Timeout (hours)"
                        description="Auto-escalate after this many hours without response"
                        value={settings.escalationTimeoutHours}
                        onValueChange={(v: number[]) => updateSetting("escalationTimeoutHours", v[0])}
                        min={1}
                        max={168}
                        step={1}
                    />

                    <Separator />

                    <SettingsToggle
                        id="allow-self-approval"
                        label="Allow Self-Approval"
                        description="Requesters can approve their own requests"
                        checked={settings.allowSelfApproval}
                        onCheckedChange={(v) => updateSetting("allowSelfApproval", v)}
                    />

                    <SettingsToggle
                        id="require-comment"
                        label="Require Comment on Rejection"
                        description="Approvers must add a comment when rejecting"
                        checked={settings.requireComment}
                        onCheckedChange={(v) => updateSetting("requireComment", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function ApprovalsNotificationSettings() {
    const { settings, updateSetting, isLoaded } = useApprovalsSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Control approval event notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="notifications-enabled"
                        label="Enable Notifications"
                        description="Receive notifications for approval events"
                        checked={settings.notificationsEnabled}
                        onCheckedChange={(v) => updateSetting("notificationsEnabled", v)}
                    />

                    <Separator />

                    <SettingsSection title="Event Triggers" description="Which events send notifications">
                        <SettingsToggle
                            id="notify-approval"
                            label="On Approval"
                            description="Notify when a request is approved"
                            checked={settings.notifyOnApproval}
                            onCheckedChange={(v) => updateSetting("notifyOnApproval", v)}
                            disabled={!settings.notificationsEnabled}
                        />

                        <SettingsToggle
                            id="notify-rejection"
                            label="On Rejection"
                            description="Notify when a request is rejected"
                            checked={settings.notifyOnRejection}
                            onCheckedChange={(v) => updateSetting("notifyOnRejection", v)}
                            disabled={!settings.notificationsEnabled}
                        />

                        <SettingsToggle
                            id="notify-escalation"
                            label="On Escalation"
                            description="Notify when a request is escalated"
                            checked={settings.notifyOnEscalation}
                            onCheckedChange={(v) => updateSetting("notifyOnEscalation", v)}
                            disabled={!settings.notificationsEnabled}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export const ApprovalsSettings = ApprovalsGeneralSettings
export default ApprovalsSettings
