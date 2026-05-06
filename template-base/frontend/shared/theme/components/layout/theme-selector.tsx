"use client"

import { useThemeConfig } from "./active-theme"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { toast } from "sonner"

/**
 * Interface for the data structure the component uses internally.
 */
interface RegistryTheme {
  name: string
  label: string
  activeColor: {
    light: string
    dark: string
  }
}

/**
 * Interfaces to correctly type the fetched registry.json data.
 */
interface RegistryItem {
  name: string
  title: string
  cssVars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

interface RegistryData {
  items: RegistryItem[]
}

const DEFAULT_THEMES = [
  {
    name: "Modern Minimal",
    value: "modern-minimal",
  },
  {
    name: "Default",
    value: "default",
  },
  {
    name: "Blue",
    value: "blue",
  },
  {
    name: "Green",
    value: "green",
  },
  {
    name: "Amber",
    value: "amber",
  },
]

const SCALED_THEMES = [
  {
    name: "Modern Minimal Scaled",
    value: "modern-minimal-scaled",
  },
  {
    name: "Default Scaled",
    value: "default-scaled",
  },
  {
    name: "Blue Scaled",
    value: "blue-scaled",
  },
]

const MONO_THEMES = [
  {
    name: "Mono",
    value: "mono-scaled",
  },
]

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig()
  // @ts-ignore — deep type recursion in Convex API refs
  const updateThemePreset = useMutation(api.user.preferences.updateThemePreset)
  const [registryThemes, setRegistryThemes] = useState<RegistryTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load themes from registry.json on component mount
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch("/r/registry.json")
        if (response.ok) {
          const registryData: RegistryData = await response.json()
          // Transform the fetched items into the structure our component expects
          const themes = registryData.items.map(
            (item): RegistryTheme => ({
              name: item.name,
              label: item.title,
              activeColor: {
                light: item.cssVars.light.primary || "var(--primary)",
                dark: item.cssVars.dark.primary || "var(--primary)",
              },
            })
          )
          setRegistryThemes(themes)
        }
      } catch (error) {
        console.error("Failed to load themes from registry:", error)
      } finally {
        setLoading(false)
      }
    }

    loadThemes()
  }, [])

  const handleThemeChange = async (value: string) => {
    const previousTheme = activeTheme
    setActiveTheme(value)
    setIsSaving(true)

    try {
      await updateThemePreset({ themePreset: value })
    } catch (error) {
      console.error("Failed to save theme preset:", error)
      setActiveTheme(previousTheme)
      toast.error("Failed to save theme preset")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="w-auto min-w-[120px] h-8 animate-pulse rounded bg-muted" />
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="theme-selector" className="sr-only">
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={(value) => void handleThemeChange(value)}>
        <SelectTrigger
          id="theme-selector"
          size="sm"
          className="justify-start w-auto min-w-[120px]"
          disabled={isSaving}
        >
          <span className="hidden text-muted-foreground lg:block">Theme:</span>
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent align="end">
          {registryThemes.length > 0 && (
            <>
              <SelectGroup>
                <SelectLabel>Registry Themes</SelectLabel>
                {registryThemes.map((theme) => (
                  <SelectItem key={theme.name} value={theme.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 border rounded-full"
                        style={{
                          backgroundColor: theme.activeColor.light,
                        }}
                      />
                      {theme.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
            </>
          )}

          <SelectGroup>
            <SelectLabel>Default</SelectLabel>
            {DEFAULT_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Scaled</SelectLabel>
            {SCALED_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Monospaced</SelectLabel>
            {MONO_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
