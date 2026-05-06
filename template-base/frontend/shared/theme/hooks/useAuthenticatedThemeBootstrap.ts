"use client"

import { useEffect } from "react"
import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { useThemeConfig } from "../components/layout/active-theme"

interface UseAuthenticatedThemeBootstrapOptions {
  enabled?: boolean
  workspaceThemePreset?: string | null
}

/**
 * Bootstraps the signed-in user's saved theme preset before workspace theme
 * resolution finishes. Workspace-specific effective themes still win.
 */
export function useAuthenticatedThemeBootstrap({
  enabled = true,
  workspaceThemePreset = null,
}: UseAuthenticatedThemeBootstrapOptions = {}) {
  const { activeTheme, setActiveTheme } = useThemeConfig()
  const userPreferences = useQuery(
    api.user.preferences.getUserPreferences,
    enabled ? {} : "skip",
  )

  useEffect(() => {
    if (!enabled) {
      return
    }

    if (workspaceThemePreset) {
      return
    }

    const userThemePreset = userPreferences?.themePreset?.trim()
    if (!userThemePreset || activeTheme === userThemePreset) {
      return
    }

    setActiveTheme(userThemePreset)
  }, [activeTheme, enabled, setActiveTheme, userPreferences?.themePreset, workspaceThemePreset])

  return {
    userThemePreset: userPreferences?.themePreset ?? null,
    isLoadingUserPreferences: userPreferences === undefined,
  }
}

export default useAuthenticatedThemeBootstrap
