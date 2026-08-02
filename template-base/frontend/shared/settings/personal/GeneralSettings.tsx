"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect } from "../primitives"

/**
 * General Settings - App-wide preferences
 * Uses next-themes for theme management
 */
export function GeneralSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the app looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Theme"
            description="Choose your preferred color scheme"
            value={theme || "system"}
            onValueChange={(value) => setTheme(value)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
          
          <SettingsSelect
            label="Language"
            description="Choose your display language"
            value="en"
            onValueChange={() => {}}
            options={[
              { value: "en", label: "English" },
              { value: "es", label: "Español" },
              { value: "fr", label: "Français" },
              { value: "de", label: "Deutsch" },
            ]}
            disabled
          />
          <p className="text-xs text-muted-foreground px-3">
            Additional languages will be available in future updates
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>
            Customize accessibility features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Reduced Motion"
            description="Minimize animations throughout the app"
            checked={false}
            onCheckedChange={() => {}}
            disabled
          />
          
          <SettingsToggle
            label="High Contrast"
            description="Increase color contrast for better visibility"
            checked={false}
            onCheckedChange={() => {}}
            disabled
          />
          <p className="text-xs text-muted-foreground px-3">
            Accessibility features will be available in future updates
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
