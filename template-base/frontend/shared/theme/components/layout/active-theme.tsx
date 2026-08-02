"use client"

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const COOKIE_NAME = "active_theme"
export const DEFAULT_ACTIVE_THEME = "modern-minimal"

type RegistryTheme = {
  name: string
  cssVars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

const MODERN_MINIMAL_VARS = {
  light: {
    background: "oklch(1.00 0 0)",
    foreground: "oklch(0.32 0 0)",
    card: "oklch(1.00 0 0)",
    "card-foreground": "oklch(0.32 0 0)",
    popover: "oklch(1.00 0 0)",
    "popover-foreground": "oklch(0.32 0 0)",
    primary: "oklch(0.62 0.19 259.81)",
    "primary-foreground": "oklch(1.00 0 0)",
    secondary: "oklch(0.97 0.00 264.54)",
    "secondary-foreground": "oklch(0.45 0.03 256.80)",
    muted: "oklch(0.98 0.00 247.84)",
    "muted-foreground": "oklch(0.55 0.02 264.36)",
    accent: "oklch(0.95 0.03 236.82)",
    "accent-foreground": "oklch(0.38 0.14 265.52)",
    destructive: "oklch(0.64 0.21 25.33)",
    "destructive-foreground": "oklch(1.00 0 0)",
    border: "oklch(0.93 0.01 264.53)",
    input: "oklch(0.93 0.01 264.53)",
    ring: "oklch(0.62 0.19 259.81)",
    "chart-1": "oklch(0.62 0.19 259.81)",
    "chart-2": "oklch(0.55 0.22 262.88)",
    "chart-3": "oklch(0.49 0.22 264.38)",
    "chart-4": "oklch(0.42 0.18 265.64)",
    "chart-5": "oklch(0.38 0.14 265.52)",
    sidebar: "oklch(0.98 0.00 247.84)",
    "sidebar-foreground": "oklch(0.32 0 0)",
    "sidebar-primary": "oklch(0.62 0.19 259.81)",
    "sidebar-primary-foreground": "oklch(1.00 0 0)",
    "sidebar-accent": "oklch(0.95 0.03 236.82)",
    "sidebar-accent-foreground": "oklch(0.38 0.14 265.52)",
    "sidebar-border": "oklch(0.93 0.01 264.53)",
    "sidebar-ring": "oklch(0.62 0.19 259.81)",
    radius: "0.375rem",
    spacing: "0.25rem",
    "letter-spacing": "0em",
    "shadow-color": "hsl(0 0% 0%)",
    "shadow-opacity": "0.1",
    "shadow-blur": "3px",
    "shadow-spread": "0px",
    "shadow-offset-x": "0",
    "shadow-offset-y": "1px",
  },
  dark: {
    background: "oklch(0.20 0 0)",
    foreground: "oklch(0.92 0 0)",
    card: "oklch(0.27 0 0)",
    "card-foreground": "oklch(0.92 0 0)",
    popover: "oklch(0.27 0 0)",
    "popover-foreground": "oklch(0.92 0 0)",
    primary: "oklch(0.62 0.19 259.81)",
    "primary-foreground": "oklch(1.00 0 0)",
    secondary: "oklch(0.27 0 0)",
    "secondary-foreground": "oklch(0.92 0 0)",
    muted: "oklch(0.27 0 0)",
    "muted-foreground": "oklch(0.72 0 0)",
    accent: "oklch(0.38 0.14 265.52)",
    "accent-foreground": "oklch(0.88 0.06 254.13)",
    destructive: "oklch(0.64 0.21 25.33)",
    "destructive-foreground": "oklch(1.00 0 0)",
    border: "oklch(0.37 0 0)",
    input: "oklch(0.37 0 0)",
    ring: "oklch(0.62 0.19 259.81)",
    "chart-1": "oklch(0.71 0.14 254.62)",
    "chart-2": "oklch(0.62 0.19 259.81)",
    "chart-3": "oklch(0.55 0.22 262.88)",
    "chart-4": "oklch(0.49 0.22 264.38)",
    "chart-5": "oklch(0.42 0.18 265.64)",
    sidebar: "oklch(0.20 0 0)",
    "sidebar-foreground": "oklch(0.92 0 0)",
    "sidebar-primary": "oklch(0.62 0.19 259.81)",
    "sidebar-primary-foreground": "oklch(1.00 0 0)",
    "sidebar-accent": "oklch(0.38 0.14 265.52)",
    "sidebar-accent-foreground": "oklch(0.88 0.06 254.13)",
    "sidebar-border": "oklch(0.37 0 0)",
    "sidebar-ring": "oklch(0.62 0.19 259.81)",
    radius: "0.375rem",
    spacing: "0.25rem",
    "letter-spacing": "0em",
    "shadow-color": "hsl(0 0% 0%)",
    "shadow-opacity": "0.1",
    "shadow-blur": "3px",
    "shadow-spread": "0px",
    "shadow-offset-x": "0",
    "shadow-offset-y": "1px",
  },
} satisfies RegistryTheme["cssVars"]

function setThemeCookie(theme: string) {
  if (typeof window === "undefined") return

  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${
    window.location.protocol === "https:" ? "Secure;" : ""
  }`
}

type ThemeContextType = {
  activeTheme: string
  previewTheme: string | null
  resolvedTheme: string
  isPreviewingTheme: boolean
  setActiveTheme: (theme: string) => void
  startThemePreview: (theme: string) => void
  clearThemePreview: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ActiveThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode
  initialTheme?: string
}) {
  const [registryThemes, setRegistryThemes] = useState<RegistryTheme[]>([])
  const [activeTheme, setActiveTheme] = useState<string>(
    () => initialTheme || DEFAULT_ACTIVE_THEME
  )
  const [previewTheme, setPreviewTheme] = useState<string | null>(null)
  const resolvedTheme = previewTheme ?? activeTheme

  useEffect(() => {
    let cancelled = false

    const loadThemes = async () => {
      try {
        const response = await fetch("/r/registry.json")
        if (!response.ok) return

        const registryData = await response.json()
        const themes = Array.isArray(registryData?.items)
          ? registryData.items.map((item: any): RegistryTheme => ({
              name: item.name,
              cssVars: item.cssVars,
            }))
          : []

        if (!cancelled) {
          setRegistryThemes(themes)
        }
      } catch (error) {
        console.error("Failed to load theme registry:", error)
      }
    }

    void loadThemes()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setThemeCookie(activeTheme)
  }, [activeTheme])

  useEffect(() => {
    Array.from(document.body.classList)
      .filter((className) => className.startsWith("theme-"))
      .forEach((className) => {
        document.body.classList.remove(className)
      })
    
    // Apply modern-minimal theme as default
    if (resolvedTheme === "modern-minimal" || resolvedTheme === "default") {
      document.body.classList.add("theme-modern-minimal")
    } else {
      document.body.classList.add(`theme-${resolvedTheme}`)
    }
    
    if (resolvedTheme.endsWith("-scaled")) {
      document.body.classList.add("theme-scaled")
    }
  }, [resolvedTheme])

  useEffect(() => {
    const root = document.documentElement

    const removeThemeVariables = () => {
      const allVarKeys = new Set<string>()

      Object.keys(MODERN_MINIMAL_VARS.light).forEach((key) => allVarKeys.add(key))
      Object.keys(MODERN_MINIMAL_VARS.dark).forEach((key) => allVarKeys.add(key))

      registryThemes.forEach((theme) => {
        Object.keys(theme.cssVars.light).forEach((key) => allVarKeys.add(key))
        Object.keys(theme.cssVars.dark).forEach((key) => allVarKeys.add(key))
      })

      allVarKeys.forEach((key) => {
        root.style.removeProperty(`--${key}`)
      })
    }

    const applyVars = (vars: Record<string, string>) => {
      removeThemeVariables()
      for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(`--${key}`, value)
      }
    }

    const applyActiveTheme = () => {
      const isDark = root.classList.contains("dark")

      if (resolvedTheme === "modern-minimal" || resolvedTheme === "default") {
        applyVars(isDark ? MODERN_MINIMAL_VARS.dark : MODERN_MINIMAL_VARS.light)
        return
      }

      const registryTheme = registryThemes.find((theme) => theme.name === resolvedTheme)
      if (registryTheme) {
        applyVars(isDark ? registryTheme.cssVars.dark : registryTheme.cssVars.light)
        return
      }

      removeThemeVariables()
    }

    applyActiveTheme()

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          applyActiveTheme()
        }
      }
    })

    observer.observe(root, { attributes: true })

    return () => {
      observer.disconnect()
    }
  }, [registryThemes, resolvedTheme])

  const value = useMemo<ThemeContextType>(() => ({
    activeTheme,
    previewTheme,
    resolvedTheme,
    isPreviewingTheme: previewTheme !== null,
    setActiveTheme,
    startThemePreview: setPreviewTheme,
    clearThemePreview: () => setPreviewTheme(null),
  }), [activeTheme, previewTheme, resolvedTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeConfig() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error(
      "useThemeConfig must be used within an ActiveThemeProvider"
    )
  }
  return context
}
