"use client"

/**
 * Inventory Feature Settings Components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useInventorySettingsStorage } from "./useInventorySettings"
import {
    SettingsSection,
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"

export function InventoryGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useInventorySettingsStorage()

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
                            <CardDescription>Configure inventory defaults</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="default-view"
                        label="Default View"
                        description="How inventory items are displayed"
                        value={settings.defaultView}
                        onValueChange={(v) => updateSetting("defaultView", v as typeof settings.defaultView)}
                        options={[
                            { value: "grid", label: "Grid" },
                            { value: "list", label: "List" },
                            { value: "table", label: "Table" },
                        ]}
                    />

                    <Separator />

                    <SettingsSlider
                        id="low-stock"
                        label="Low Stock Threshold"
                        description="Items below this count are considered low stock"
                        value={settings.lowStockThreshold}
                        onValueChange={(v: number[]) => updateSetting("lowStockThreshold", v[0])}
                        min={1}
                        max={100}
                        step={1}
                    />

                    <SettingsToggle
                        id="out-of-stock"
                        label="Show Out of Stock"
                        description="Display items with zero quantity"
                        checked={settings.showOutOfStock}
                        onCheckedChange={(v) => updateSetting("showOutOfStock", v)}
                    />

                    <SettingsToggle
                        id="track-qty"
                        label="Track Quantity"
                        description="Enable quantity tracking for items"
                        checked={settings.trackQuantity}
                        onCheckedChange={(v) => updateSetting("trackQuantity", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function InventoryDisplaySettings() {
    const { settings, updateSetting, isLoaded } = useInventorySettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize inventory appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="stock-levels"
                        label="Show Stock Levels"
                        description="Display current quantity for items"
                        checked={settings.showStockLevels}
                        onCheckedChange={(v) => updateSetting("showStockLevels", v)}
                    />

                    <SettingsToggle
                        id="prices"
                        label="Show Prices"
                        description="Display item prices"
                        checked={settings.showPrices}
                        onCheckedChange={(v) => updateSetting("showPrices", v)}
                    />

                    <SettingsSelect
                        id="unit-format"
                        label="Unit Format"
                        description="How quantities are labeled"
                        value={settings.unitFormat}
                        onValueChange={(v) => updateSetting("unitFormat", v as typeof settings.unitFormat)}
                        options={[
                            { value: "units", label: "Units" },
                            { value: "pieces", label: "Pieces" },
                            { value: "items", label: "Items" },
                            { value: "custom", label: "Custom" },
                        ]}
                    />

                    <Separator />

                    <SettingsSection title="Images" description="Product image settings">
                        <SettingsToggle
                            id="images"
                            label="Show Images"
                            description="Display product images"
                            checked={settings.showImages}
                            onCheckedChange={(v) => updateSetting("showImages", v)}
                        />

                        <SettingsSelect
                            id="image-size"
                            label="Image Size"
                            description="Size of product images"
                            value={settings.imageSize}
                            onValueChange={(v) => updateSetting("imageSize", v as typeof settings.imageSize)}
                            options={[
                                { value: "small", label: "Small" },
                                { value: "medium", label: "Medium" },
                                { value: "large", label: "Large" },
                            ]}
                            disabled={!settings.showImages}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export function InventoryAlertSettings() {
    const { settings, updateSetting, isLoaded } = useInventorySettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Alerts</CardTitle>
                    <CardDescription>Configure inventory notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="low-stock-alert"
                        label="Low Stock Notifications"
                        description="Notify when items are running low"
                        checked={settings.lowStockNotifications}
                        onCheckedChange={(v) => updateSetting("lowStockNotifications", v)}
                    />

                    <SettingsToggle
                        id="out-of-stock-alert"
                        label="Out of Stock Notifications"
                        description="Notify when items are completely out"
                        checked={settings.outOfStockNotifications}
                        onCheckedChange={(v) => updateSetting("outOfStockNotifications", v)}
                    />

                    <Separator />

                    <SettingsSection title="Expiry Warnings" description="For perishable items">
                        <SettingsToggle
                            id="expiry"
                            label="Expiry Warnings"
                            description="Notify before items expire"
                            checked={settings.expiryWarnings}
                            onCheckedChange={(v) => updateSetting("expiryWarnings", v)}
                        />

                        <SettingsSelect
                            id="expiry-days"
                            label="Warning Days"
                            description="Days before expiry to warn"
                            value={String(settings.expiryWarningDays)}
                            onValueChange={(v) => updateSetting("expiryWarningDays", Number(v) as typeof settings.expiryWarningDays)}
                            options={[
                                { value: "7", label: "7 days before" },
                                { value: "14", label: "14 days before" },
                                { value: "30", label: "30 days before" },
                                { value: "60", label: "60 days before" },
                            ]}
                            disabled={!settings.expiryWarnings}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export function InventoryAutomationSettings() {
    const { settings, updateSetting, isLoaded } = useInventorySettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Automation</CardTitle>
                    <CardDescription>Configure automatic inventory actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="auto-reorder"
                        label="Auto-Reorder"
                        description="Automatically create reorder requests"
                        checked={settings.autoReorder}
                        onCheckedChange={(v) => updateSetting("autoReorder", v)}
                    />

                    <SettingsSlider
                        id="reorder-point"
                        label="Reorder Point"
                        description="Quantity at which to trigger reorder"
                        value={settings.reorderPoint}
                        onValueChange={(v: number[]) => updateSetting("reorderPoint", v[0])}
                        min={1}
                        max={50}
                        step={1}
                        disabled={!settings.autoReorder}
                    />

                    <SettingsSlider
                        id="reorder-qty"
                        label="Reorder Quantity"
                        description="Default quantity to reorder"
                        value={settings.reorderQuantity}
                        onValueChange={(v: number[]) => updateSetting("reorderQuantity", v[0])}
                        min={1}
                        max={200}
                        step={5}
                        disabled={!settings.autoReorder}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const InventorySettings = InventoryGeneralSettings
