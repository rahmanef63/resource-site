"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    SettingsToggle,
    SettingsSelect,
} from "@/frontend/shared/settings/primitives"
import { useSettingsStorage } from "@/frontend/shared/settings/hooks/useSettingsStorage"

interface MenuSettingsSchema {
    showIcons: boolean
    showDescriptions: boolean
    compactMode: boolean
    defaultCollapsed: boolean
    openInNewTab: boolean
    rememberExpanded: boolean
    groupByCategory: boolean
    defaultView: "sidebar" | "topbar" | "both"
}

const DEFAULT_MENU_SETTINGS: MenuSettingsSchema = {
    showIcons: true,
    showDescriptions: false,
    compactMode: false,
    defaultCollapsed: false,
    openInNewTab: false,
    rememberExpanded: true,
    groupByCategory: true,
    defaultView: "sidebar",
}

export function MenuStoreSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useSettingsStorage<MenuSettingsSchema>(
        "menus",
        DEFAULT_MENU_SETTINGS
    )

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Display</CardTitle>
                            <CardDescription>How menu items are shown</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>Reset</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="default-view"
                        label="Default Navigation Style"
                        description="Where the main navigation is shown"
                        value={settings.defaultView}
                        onValueChange={(v) => updateSetting("defaultView", v as typeof settings.defaultView)}
                        options={[
                            { value: "sidebar", label: "Sidebar" },
                            { value: "topbar", label: "Top Bar" },
                            { value: "both", label: "Both" },
                        ]}
                    />

                    <Separator />

                    <SettingsToggle
                        id="show-icons"
                        label="Show Icons"
                        description="Display icons next to menu items"
                        checked={settings.showIcons}
                        onCheckedChange={(v) => updateSetting("showIcons", v)}
                    />

                    <SettingsToggle
                        id="show-descriptions"
                        label="Show Descriptions"
                        description="Show a short description below each menu item"
                        checked={settings.showDescriptions}
                        onCheckedChange={(v) => updateSetting("showDescriptions", v)}
                    />

                    <SettingsToggle
                        id="compact-mode"
                        label="Compact Mode"
                        description="Reduce spacing between menu items"
                        checked={settings.compactMode}
                        onCheckedChange={(v) => updateSetting("compactMode", v)}
                    />

                    <SettingsToggle
                        id="group-by-category"
                        label="Group by Category"
                        description="Organize menu items into category sections"
                        checked={settings.groupByCategory}
                        onCheckedChange={(v) => updateSetting("groupByCategory", v)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Behavior</CardTitle>
                    <CardDescription>How the menu behaves when navigating</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="default-collapsed"
                        label="Start Collapsed"
                        description="Collapse the sidebar when the app loads"
                        checked={settings.defaultCollapsed}
                        onCheckedChange={(v) => updateSetting("defaultCollapsed", v)}
                    />

                    <SettingsToggle
                        id="remember-expanded"
                        label="Remember Expanded State"
                        description="Restore the sidebar state between sessions"
                        checked={settings.rememberExpanded}
                        onCheckedChange={(v) => updateSetting("rememberExpanded", v)}
                    />

                    <SettingsToggle
                        id="open-new-tab"
                        label="Open Links in New Tab"
                        description="Navigate to features in a new browser tab"
                        checked={settings.openInNewTab}
                        onCheckedChange={(v) => updateSetting("openInNewTab", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default MenuStoreSettings
