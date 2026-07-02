"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"
import { usePOSSettingsStorage } from "./usePOSSettings"

export function POSGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = usePOSSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>General</CardTitle>
                            <CardDescription>Point of sale defaults</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>Reset</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="currency"
                        label="Currency"
                        description="Currency used in transactions"
                        value={settings.currency}
                        onValueChange={(v) => updateSetting("currency", v)}
                        options={[
                            { value: "USD", label: "USD — US Dollar" },
                            { value: "EUR", label: "EUR — Euro" },
                            { value: "GBP", label: "GBP — British Pound" },
                            { value: "IDR", label: "IDR — Indonesian Rupiah" },
                            { value: "SGD", label: "SGD — Singapore Dollar" },
                            { value: "JPY", label: "JPY — Japanese Yen" },
                        ]}
                    />

                    <SettingsSelect
                        id="tax-display"
                        label="Tax Display"
                        description="How tax is shown on receipts"
                        value={settings.taxDisplay}
                        onValueChange={(v) => updateSetting("taxDisplay", v as typeof settings.taxDisplay)}
                        options={[
                            { value: "inclusive", label: "Tax included in price" },
                            { value: "exclusive", label: "Tax shown separately" },
                            { value: "hidden", label: "Do not show tax" },
                        ]}
                    />

                    <SettingsSelect
                        id="rounding-mode"
                        label="Price Rounding"
                        description="How totals are rounded"
                        value={settings.roundingMode}
                        onValueChange={(v) => updateSetting("roundingMode", v as typeof settings.roundingMode)}
                        options={[
                            { value: "none", label: "No rounding" },
                            { value: "nearest", label: "Round to nearest" },
                            { value: "up", label: "Always round up" },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function POSTerminalSettings() {
    const { settings, updateSetting, isLoaded } = usePOSSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Terminal</CardTitle>
                    <CardDescription>Hardware and receipt configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="receipt-format"
                        label="Receipt Format"
                        description="How receipts are printed or displayed"
                        value={settings.receiptFormat}
                        onValueChange={(v) => updateSetting("receiptFormat", v as typeof settings.receiptFormat)}
                        options={[
                            { value: "detailed", label: "Detailed" },
                            { value: "compact", label: "Compact" },
                            { value: "none", label: "No receipt" },
                        ]}
                    />

                    <SettingsToggle
                        id="auto-print"
                        label="Auto-Print Receipt"
                        description="Automatically print receipt after each sale"
                        checked={settings.autoPrintReceipt}
                        onCheckedChange={(v) => updateSetting("autoPrintReceipt", v)}
                    />

                    <Separator />

                    <SettingsToggle
                        id="barcode-scanner"
                        label="Barcode Scanner"
                        description="Enable USB/Bluetooth barcode scanner input"
                        checked={settings.barcodeScanner}
                        onCheckedChange={(v) => updateSetting("barcodeScanner", v)}
                    />

                    <SettingsToggle
                        id="cash-drawer"
                        label="Cash Drawer"
                        description="Trigger cash drawer opening on sale"
                        checked={settings.cashDrawer}
                        onCheckedChange={(v) => updateSetting("cashDrawer", v)}
                    />

                    <Separator />

                    <SettingsToggle
                        id="low-stock-warning"
                        label="Low Stock Warning"
                        description="Alert when product stock is below threshold"
                        checked={settings.lowStockWarning}
                        onCheckedChange={(v) => updateSetting("lowStockWarning", v)}
                    />

                    <SettingsSlider
                        id="low-stock-threshold"
                        label={`Low Stock Threshold (${settings.lowStockThreshold})`}
                        description="Units remaining to trigger low stock alert"
                        value={settings.lowStockThreshold}
                        onValueChange={(v: number[]) => updateSetting("lowStockThreshold", v[0])}
                        min={1}
                        max={50}
                        step={1}
                        disabled={!settings.lowStockWarning}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const PosSettings = POSGeneralSettings
export default PosSettings
