/**
 * useWorkspaceTheme Hook
 * 
 * Applies workspace-specific theme when workspace changes.
 * Handles theme inheritance from parent workspaces.
 */

"use client"

import { useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { useThemeConfig } from "@/frontend/shared/theme"
import { useAuthenticatedThemeBootstrap } from "./useAuthenticatedThemeBootstrap"

interface UseWorkspaceThemeOptions {
    /** Current workspace ID */
    workspaceId?: Id<"workspaces"> | null
    /** Whether to apply theme automatically */
    autoApply?: boolean
}

/**
 * Hook to manage workspace-specific themes.
 * 
 * - Fetches effective theme for current workspace (with inheritance)
 * - Applies theme when workspace changes
 * - Falls back to user's global preference
 */
export function useWorkspaceTheme({
    workspaceId,
    autoApply = true,
}: UseWorkspaceThemeOptions = {}) {
    const { activeTheme, setActiveTheme } = useThemeConfig()

    // Get effective theme for workspace (with inheritance)
    const effectiveTheme = useQuery(
        api.workspace.storage.getWorkspaceEffectiveTheme,
        workspaceId ? { workspaceId } : "skip"
    )
    const { userThemePreset } = useAuthenticatedThemeBootstrap({
        enabled: autoApply,
        workspaceThemePreset: effectiveTheme?.themePreset ?? null,
    })

    // Apply workspace theme when it changes
    useEffect(() => {
        if (!autoApply) return
        const nextThemePreset = effectiveTheme?.themePreset ?? userThemePreset
        if (!nextThemePreset) return
        if (activeTheme === nextThemePreset) return

        if (nextThemePreset) {
            setActiveTheme(nextThemePreset)
        }
    }, [activeTheme, effectiveTheme?.themePreset, autoApply, setActiveTheme, userThemePreset])

    return {
        /** The resolved theme for current workspace */
        workspaceTheme: effectiveTheme?.themePreset ?? null,
        /** Which workspace the theme was inherited from (null = own theme) */
        inheritedFrom: effectiveTheme?.inheritedFrom ?? null,
        /** Whether the current user has their own theme override for this workspace */
        hasOwnTheme: effectiveTheme?.source === "user_workspace",
        /** Where the active theme is currently resolved from */
        source: effectiveTheme?.source ?? "none",
        /** Current active theme (may be user global if workspace has no theme) */
        activeTheme,
    }
}

export default useWorkspaceTheme
