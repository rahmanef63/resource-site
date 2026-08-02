"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, Palette, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type ThemeMode = "light" | "dark" | "system"

export interface ThemeToggleProps {
  variant?: "switch" | "dropdown" | "buttons"
  showLabel?: boolean
  className?: string
}

/**
 * Simple Switch Toggle for Theme
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Sun className="h-4 w-4" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <Moon className="h-4 w-4" />
    </div>
  )
}

/**
 * Dropdown Theme Selector
 */
export function ThemeDropdown({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const themes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  const currentTheme = themes.find((t) => t.value === theme)
  const Icon = currentTheme?.icon ?? Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Icon className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map(({ value, label, icon: ItemIcon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <ItemIcon className="h-4 w-4" />
              {label}
            </span>
            {theme === value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Button Group Theme Selector
 */
export function ThemeButtons({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const themes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border p-1", className)}>
      {themes.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={theme === value ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTheme(value)}
          className="gap-2"
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  )
}

/**
 * Theme Settings Card (for Settings page)
 */
export function ThemeSettingsCard({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Appearance
        </CardTitle>
        <CardDescription>
          Customize how the app looks on your device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Theme Mode</Label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "light", label: "Light", icon: Sun, description: "Bright colors" },
              { value: "dark", label: "Dark", icon: Moon, description: "Easy on eyes" },
              { value: "system", label: "System", icon: Monitor, description: "Follows OS" },
            ].map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                  theme === value
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/50"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Main Theme Toggle Component (Flexible)
 */
export function ThemeToggle({ variant = "dropdown", showLabel, className }: ThemeToggleProps) {
  switch (variant) {
    case "switch":
      return <ThemeSwitch className={className} />
    case "buttons":
      return <ThemeButtons className={className} />
    case "dropdown":
    default:
      return <ThemeDropdown className={className} />
  }
}
