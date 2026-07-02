"use client"

/**
 * Forms Feature Settings Components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useFormsSettingsStorage } from "./useFormsSettings"
import {
    SettingsSection,
    SettingsToggle,
    SettingsSelect,
} from "@/frontend/shared/settings/primitives"

export function FormsGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useFormsSettingsStorage()

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
                            <CardDescription>Configure form defaults</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="theme"
                        label="Default Theme"
                        description="Form color theme"
                        value={settings.defaultTheme}
                        onValueChange={(v) => updateSetting("defaultTheme", v as typeof settings.defaultTheme)}
                        options={[
                            { value: "light", label: "Light" },
                            { value: "dark", label: "Dark" },
                            { value: "system", label: "System" },
                        ]}
                    />

                    <SettingsToggle
                        id="progress"
                        label="Show Progress Bar"
                        description="Display form completion progress"
                        checked={settings.showProgressBar}
                        onCheckedChange={(v) => updateSetting("showProgressBar", v)}
                    />

                    <Separator />

                    <SettingsSection title="Auto-Save" description="Save form progress">
                        <SettingsToggle
                            id="save"
                            label="Allow Save Progress"
                            description="Let users save and continue later"
                            checked={settings.allowSave}
                            onCheckedChange={(v) => updateSetting("allowSave", v)}
                        />

                        <SettingsSelect
                            id="save-interval"
                            label="Auto-Save Interval"
                            description="How often to save automatically"
                            value={String(settings.autoSaveInterval)}
                            onValueChange={(v) => updateSetting("autoSaveInterval", Number(v) as typeof settings.autoSaveInterval)}
                            options={[
                                { value: "30", label: "30 seconds" },
                                { value: "60", label: "1 minute" },
                                { value: "120", label: "2 minutes" },
                            ]}
                            disabled={!settings.allowSave}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export function FormsAppearanceSettings() {
    const { settings, updateSetting, isLoaded } = useFormsSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize form appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="width"
                        label="Form Width"
                        description="Width of form container"
                        value={settings.formWidth}
                        onValueChange={(v) => updateSetting("formWidth", v as typeof settings.formWidth)}
                        options={[
                            { value: "compact", label: "Compact" },
                            { value: "normal", label: "Normal" },
                            { value: "wide", label: "Wide" },
                        ]}
                    />

                    <SettingsToggle
                        id="required"
                        label="Show Required Indicator"
                        description="Mark required fields with asterisk"
                        checked={settings.showRequired}
                        onCheckedChange={(v) => updateSetting("showRequired", v)}
                    />

                    <SettingsSelect
                        id="label-position"
                        label="Label Position"
                        description="Where field labels appear"
                        value={settings.labelPosition}
                        onValueChange={(v) => updateSetting("labelPosition", v as typeof settings.labelPosition)}
                        options={[
                            { value: "top", label: "Top" },
                            { value: "left", label: "Left" },
                            { value: "inline", label: "Inline" },
                        ]}
                    />

                    <SettingsSelect
                        id="input-size"
                        label="Input Size"
                        description="Size of form inputs"
                        value={settings.inputSize}
                        onValueChange={(v) => updateSetting("inputSize", v as typeof settings.inputSize)}
                        options={[
                            { value: "small", label: "Small" },
                            { value: "medium", label: "Medium" },
                            { value: "large", label: "Large" },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function FormsSubmissionSettings() {
    const { settings, updateSetting, isLoaded } = useFormsSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                    <CardDescription>Configure submission behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="confirm"
                        label="Confirm Before Submit"
                        description="Show confirmation dialog"
                        checked={settings.confirmSubmission}
                        onCheckedChange={(v) => updateSetting("confirmSubmission", v)}
                    />

                    <SettingsToggle
                        id="email"
                        label="Send Confirmation Email"
                        description="Email confirmation to respondent"
                        checked={settings.sendConfirmationEmail}
                        onCheckedChange={(v) => updateSetting("sendConfirmationEmail", v)}
                    />

                    <SettingsToggle
                        id="multiple"
                        label="Allow Multiple Submissions"
                        description="Let users submit more than once"
                        checked={settings.allowMultipleSubmissions}
                        onCheckedChange={(v) => updateSetting("allowMultipleSubmissions", v)}
                    />

                    <SettingsToggle
                        id="success"
                        label="Show Success Message"
                        description="Display message after submission"
                        checked={settings.showSuccessMessage}
                        onCheckedChange={(v) => updateSetting("showSuccessMessage", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function FormsPrivacySettings() {
    const { settings, updateSetting, isLoaded } = useFormsSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Privacy</CardTitle>
                    <CardDescription>Configure data privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="analytics"
                        label="Collect Analytics"
                        description="Track form usage statistics"
                        checked={settings.collectAnalytics}
                        onCheckedChange={(v) => updateSetting("collectAnalytics", v)}
                    />

                    <SettingsToggle
                        id="store"
                        label="Store Submissions"
                        description="Keep submission data"
                        checked={settings.storeSubmissions}
                        onCheckedChange={(v) => updateSetting("storeSubmissions", v)}
                    />

                    <SettingsSelect
                        id="retention"
                        label="Data Retention"
                        description="How long to keep submissions"
                        value={String(settings.submissionRetention)}
                        onValueChange={(v) => updateSetting("submissionRetention", Number(v) as typeof settings.submissionRetention)}
                        options={[
                            { value: "30", label: "30 days" },
                            { value: "90", label: "90 days" },
                            { value: "365", label: "1 year" },
                            { value: "0", label: "Forever" },
                        ]}
                        disabled={!settings.storeSubmissions}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const FormsSettings = FormsGeneralSettings
