"use client"

/**
 * CRM Feature Settings Components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCRMSettingsStorage } from "./useCRMSettings"
import {
    SettingsSection,
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"

export function CRMGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useCRMSettingsStorage()

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
                            <CardDescription>Configure CRM defaults and behavior</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="pipeline-view"
                        label="Default Pipeline View"
                        description="How deals are displayed by default"
                        value={settings.defaultPipelineView}
                        onValueChange={(v) => updateSetting("defaultPipelineView", v as typeof settings.defaultPipelineView)}
                        options={[
                            { value: "kanban", label: "Kanban Board" },
                            { value: "list", label: "List View" },
                            { value: "table", label: "Table View" },
                        ]}
                    />

                    <SettingsSelect
                        id="auto-refresh"
                        label="Auto-Refresh Interval"
                        description="How often to refresh data"
                        value={String(settings.autoRefreshInterval)}
                        onValueChange={(v) => updateSetting("autoRefreshInterval", Number(v) as typeof settings.autoRefreshInterval)}
                        options={[
                            { value: "0", label: "Disabled" },
                            { value: "30", label: "30 seconds" },
                            { value: "60", label: "1 minute" },
                            { value: "300", label: "5 minutes" },
                        ]}
                    />

                    <Separator />

                    <SettingsToggle
                        id="show-values"
                        label="Show Deal Values"
                        description="Display monetary values on deal cards"
                        checked={settings.showDealValues}
                        onCheckedChange={(v) => updateSetting("showDealValues", v)}
                    />

                    <SettingsSelect
                        id="currency"
                        label="Currency Display"
                        description="How to show currency on deals"
                        value={settings.currencyDisplay}
                        onValueChange={(v) => updateSetting("currencyDisplay", v as typeof settings.currencyDisplay)}
                        options={[
                            { value: "symbol", label: "Symbol ($, €, £)" },
                            { value: "code", label: "Code (USD, EUR)" },
                            { value: "none", label: "Hide Currency" },
                        ]}
                        disabled={!settings.showDealValues}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function CRMDisplaySettings() {
    const { settings, updateSetting, isLoaded } = useCRMSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize how contacts and deals appear</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="card-style"
                        label="Card Style"
                        description="How deal cards are displayed"
                        value={settings.cardStyle}
                        onValueChange={(v) => updateSetting("cardStyle", v as typeof settings.cardStyle)}
                        options={[
                            { value: "compact", label: "Compact" },
                            { value: "detailed", label: "Detailed" },
                            { value: "expanded", label: "Expanded" },
                        ]}
                    />

                    <Separator />

                    <SettingsToggle
                        id="contact-photos"
                        label="Show Contact Photos"
                        description="Display profile pictures for contacts"
                        checked={settings.showContactPhotos}
                        onCheckedChange={(v) => updateSetting("showContactPhotos", v)}
                    />

                    <SettingsToggle
                        id="company-logos"
                        label="Show Company Logos"
                        description="Display company logos when available"
                        checked={settings.showCompanyLogos}
                        onCheckedChange={(v) => updateSetting("showCompanyLogos", v)}
                    />

                    <SettingsToggle
                        id="color-code"
                        label="Color Code by Stage"
                        description="Use colors to indicate deal stages"
                        checked={settings.colorCodeByStage}
                        onCheckedChange={(v) => updateSetting("colorCodeByStage", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function CRMNotificationSettings() {
    const { settings, updateSetting, isLoaded } = useCRMSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Control what CRM events trigger notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="deal-updates"
                        label="Deal Updates"
                        description="Notify when deals are modified"
                        checked={settings.notifyDealUpdates}
                        onCheckedChange={(v) => updateSetting("notifyDealUpdates", v)}
                    />

                    <SettingsToggle
                        id="stage-changes"
                        label="Stage Changes"
                        description="Notify when deals move to new stages"
                        checked={settings.notifyStageChanges}
                        onCheckedChange={(v) => updateSetting("notifyStageChanges", v)}
                    />

                    <SettingsToggle
                        id="new-leads"
                        label="New Leads"
                        description="Notify when new leads are created"
                        checked={settings.notifyNewLeads}
                        onCheckedChange={(v) => updateSetting("notifyNewLeads", v)}
                    />

                    <SettingsToggle
                        id="task-due"
                        label="Task Due Reminders"
                        description="Notify when CRM tasks are due"
                        checked={settings.notifyTaskDue}
                        onCheckedChange={(v) => updateSetting("notifyTaskDue", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function CRMAutomationSettings() {
    const { settings, updateSetting, isLoaded } = useCRMSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Automation</CardTitle>
                    <CardDescription>Configure automatic CRM actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="auto-assign"
                        label="Auto-Assign Leads"
                        description="Automatically assign new leads to team members"
                        checked={settings.autoAssignLeads}
                        onCheckedChange={(v) => updateSetting("autoAssignLeads", v)}
                    />

                    <SettingsToggle
                        id="auto-tasks"
                        label="Auto-Create Tasks"
                        description="Create follow-up tasks automatically"
                        checked={settings.autoCreateTasks}
                        onCheckedChange={(v) => updateSetting("autoCreateTasks", v)}
                    />

                    <Separator />

                    <SettingsSection title="Follow-up" description="Automatic follow-up settings">
                        <SettingsToggle
                            id="auto-followup"
                            label="Auto Follow-Up"
                            description="Enable automatic follow-up reminders"
                            checked={settings.autoFollowUp}
                            onCheckedChange={(v) => updateSetting("autoFollowUp", v)}
                        />

                        <SettingsSlider
                            id="followup-days"
                            label="Follow-Up Days"
                            description="Days before follow-up reminder"
                            value={settings.followUpDays}
                            onValueChange={(v: number[]) => updateSetting("followUpDays", v[0])}
                            min={1}
                            max={14}
                            step={1}
                            disabled={!settings.autoFollowUp}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export const CRMSettings = CRMGeneralSettings
