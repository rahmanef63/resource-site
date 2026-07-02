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
import { useUserManagementSettingsStorage } from "./useUserManagementSettings"

export function UserManagementGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useUserManagementSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>New Users</CardTitle>
                            <CardDescription>Defaults for newly invited members</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>Reset</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="default-role"
                        label="Default Role"
                        description="Role assigned to new workspace members"
                        value={settings.defaultRole}
                        onValueChange={(v) => updateSetting("defaultRole", v as typeof settings.defaultRole)}
                        options={[
                            { value: "viewer", label: "Viewer — read only" },
                            { value: "member", label: "Member — can edit" },
                            { value: "editor", label: "Editor — full access" },
                        ]}
                    />

                    <SettingsSlider
                        id="invite-expiry"
                        label={`Invite Expiry (${settings.inviteExpiryDays} days)`}
                        description="Days before an invitation link expires"
                        value={settings.inviteExpiryDays}
                        onValueChange={(v: number[]) => updateSetting("inviteExpiryDays", v[0])}
                        min={1}
                        max={30}
                        step={1}
                    />

                    <SettingsToggle
                        id="send-welcome"
                        label="Send Welcome Email"
                        description="Email new members with onboarding instructions"
                        checked={settings.sendWelcomeEmail}
                        onCheckedChange={(v) => updateSetting("sendWelcomeEmail", v)}
                    />

                    <SettingsToggle
                        id="allow-guest"
                        label="Allow Guest Access"
                        description="Let non-members view public workspace content"
                        checked={settings.allowGuestAccess}
                        onCheckedChange={(v) => updateSetting("allowGuestAccess", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function UserManagementSecuritySettings() {
    const { settings, updateSetting, isLoaded } = useUserManagementSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Access control and session policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="enforce-2fa"
                        label="Enforce Two-Factor Auth"
                        description="Require 2FA for all workspace members"
                        checked={settings.enforce2FA}
                        onCheckedChange={(v) => updateSetting("enforce2FA", v)}
                    />

                    <Separator />

                    <SettingsSlider
                        id="session-timeout"
                        label={settings.sessionTimeoutMinutes === 0
                            ? "Session Timeout — Never"
                            : `Session Timeout (${settings.sessionTimeoutMinutes} min)`}
                        description="Automatically sign out inactive users (0 = disabled)"
                        value={settings.sessionTimeoutMinutes}
                        onValueChange={(v: number[]) => updateSetting("sessionTimeoutMinutes", v[0])}
                        min={0}
                        max={480}
                        step={15}
                    />

                    <Separator />

                    <SettingsSlider
                        id="auto-deactivate"
                        label={settings.autoDeactivateInactiveDays === 0
                            ? "Auto-Deactivate Inactive Users — Disabled"
                            : `Auto-Deactivate after ${settings.autoDeactivateInactiveDays} days`}
                        description="Deactivate users inactive for this many days (0 = disabled)"
                        value={settings.autoDeactivateInactiveDays}
                        onValueChange={(v: number[]) => updateSetting("autoDeactivateInactiveDays", v[0])}
                        min={0}
                        max={365}
                        step={30}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>User activity alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSection title="Alert on" description="Which events trigger admin notifications">
                        <SettingsToggle
                            id="notify-new-user"
                            label="New Member Join"
                            description="Alert when someone accepts an invitation"
                            checked={settings.notifyOnNewUser}
                            onCheckedChange={(v) => updateSetting("notifyOnNewUser", v)}
                        />

                        <SettingsToggle
                            id="notify-role-change"
                            label="Role Change"
                            description="Alert when a member's role is updated"
                            checked={settings.notifyOnRoleChange}
                            onCheckedChange={(v) => updateSetting("notifyOnRoleChange", v)}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export const UserManagementSettings = UserManagementGeneralSettings
export default UserManagementSettings
