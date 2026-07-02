"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"
import { useSettingsStorage } from "@/frontend/shared/settings/hooks/useSettingsStorage"

interface WorkspaceStoreSettingsSchema {
    autoSync: boolean
    syncIntervalMinutes: number
    showFeaturedItems: boolean
    defaultView: "grid" | "list"
    notifyOnUpdate: boolean
    notifyOnNewFeature: boolean
    autoInstallUpdates: boolean
    showBetaFeatures: boolean
}

const DEFAULT_WORKSPACE_STORE_SETTINGS: WorkspaceStoreSettingsSchema = {
    autoSync: true,
    syncIntervalMinutes: 60,
    showFeaturedItems: true,
    defaultView: "grid",
    notifyOnUpdate: true,
    notifyOnNewFeature: true,
    autoInstallUpdates: false,
    showBetaFeatures: false,
}

export function WorkspaceStoreSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useSettingsStorage<WorkspaceStoreSettingsSchema>(
        "workspace-store",
        DEFAULT_WORKSPACE_STORE_SETTINGS
    )

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Store Display</CardTitle>
                            <CardDescription>How the workspace store is presented</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>Reset</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="default-view"
                        label="Default View"
                        description="How store items are laid out by default"
                        value={settings.defaultView}
                        onValueChange={(v) => updateSetting("defaultView", v as typeof settings.defaultView)}
                        options={[
                            { value: "grid", label: "Grid" },
                            { value: "list", label: "List" },
                        ]}
                    />

                    <SettingsToggle
                        id="show-featured"
                        label="Show Featured Items"
                        description="Highlight curated apps in the store header"
                        checked={settings.showFeaturedItems}
                        onCheckedChange={(v) => updateSetting("showFeaturedItems", v)}
                    />

                    <SettingsToggle
                        id="show-beta"
                        label="Show Beta Features"
                        description="Include features in early access / beta"
                        checked={settings.showBetaFeatures}
                        onCheckedChange={(v) => updateSetting("showBetaFeatures", v)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sync & Updates</CardTitle>
                    <CardDescription>Keep the store catalog up to date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="auto-sync"
                        label="Auto-Sync Catalog"
                        description="Periodically refresh the store catalog"
                        checked={settings.autoSync}
                        onCheckedChange={(v) => updateSetting("autoSync", v)}
                    />

                    <SettingsSlider
                        id="sync-interval"
                        label={`Sync Interval (${settings.syncIntervalMinutes} min)`}
                        description="How often to check for catalog updates"
                        value={settings.syncIntervalMinutes}
                        onValueChange={(v: number[]) => updateSetting("syncIntervalMinutes", v[0])}
                        min={15}
                        max={1440}
                        step={15}
                        disabled={!settings.autoSync}
                    />

                    <Separator />

                    <SettingsToggle
                        id="auto-install-updates"
                        label="Auto-Install Updates"
                        description="Automatically install feature updates when available"
                        checked={settings.autoInstallUpdates}
                        onCheckedChange={(v) => updateSetting("autoInstallUpdates", v)}
                    />

                    <Separator />

                    <SettingsToggle
                        id="notify-update"
                        label="Notify on Feature Update"
                        description="Alert when installed features have updates"
                        checked={settings.notifyOnUpdate}
                        onCheckedChange={(v) => updateSetting("notifyOnUpdate", v)}
                    />

                    <SettingsToggle
                        id="notify-new-feature"
                        label="Notify on New Feature"
                        description="Alert when new features are added to the store"
                        checked={settings.notifyOnNewFeature}
                        onCheckedChange={(v) => updateSetting("notifyOnNewFeature", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default WorkspaceStoreSettings
