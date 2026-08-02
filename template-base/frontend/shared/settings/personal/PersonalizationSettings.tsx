"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect, SettingsRadioGroup } from "../primitives"
import { ThemeSelector, useThemeConfig } from "@/frontend/shared/theme"
import { Label } from "@/components/ui/label"

/**
 * Personalization Settings - UI customization
 * Uses next-themes for theme management and custom theme selector
 */
export function PersonalizationSettings() {
  const { theme, setTheme } = useTheme()
  const { activeTheme } = useThemeConfig()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Customize the look and feel of your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Scheme (Light/Dark/System) */}
          <SettingsRadioGroup
            id="color-scheme"
            label="Color Scheme"
            description="Choose your preferred color scheme"
            value={theme || "system"}
            onValueChange={(value) => setTheme(value)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
          
          {/* Theme Preset Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Theme Preset</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select a color theme from our curated collection
            </p>
            <ThemeSelector />
            <p className="text-xs text-muted-foreground mt-2">
              Current theme: <span className="font-medium">{activeTheme}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              This preset becomes your default for workspaces without a custom override.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
          <CardDescription>
            Configure the app layout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Compact Mode"
            description="Reduce spacing for more content"
            checked={false}
            onCheckedChange={() => {}}
            disabled
          />
          
          <SettingsToggle
            label="Show Sidebar"
            description="Display sidebar navigation"
            checked={true}
            onCheckedChange={() => {}}
            disabled
          />
          
          <SettingsSelect
            label="Sidebar Position"
            description="Position of the sidebar"
            value="left"
            onValueChange={() => {}}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
            disabled
          />
          <p className="text-xs text-muted-foreground px-3">
            Layout customization will be available in future updates
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
