/**
 * Icon Utilities
 * 
 * Utilities for resolving icon names to React components.
 */

import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { WORKSPACE_TYPE_ICONS } from "@/frontend/shared/constants"

// ============================================================================
// Icon Resolution
// ============================================================================

/**
 * Get a Lucide icon component by name.
 * 
 * @param iconName - The name of the icon (e.g., "Home", "FileText")
 * @param fallback - Optional fallback icon name if not found
 * @returns The icon component
 * 
 * @example
 * ```tsx
 * const Icon = getIconComponent("Home")
 * return <Icon className="h-4 w-4" />
 * ```
 */
export function getIconComponent(
    iconName: string,
    fallback = "Circle"
): LucideIcon {
    const icons = LucideIcons as unknown as Record<string, LucideIcon>
    return icons[iconName] ?? icons[fallback] ?? LucideIcons.Circle
}

/**
 * Get the icon component for a workspace type.
 * 
 * @param type - The workspace type (e.g., "personal", "organization")
 * @returns The icon component for that workspace type
 * 
 * @example
 * ```tsx
 * const Icon = getWorkspaceTypeIcon("organization")
 * return <Icon className="h-5 w-5" />
 * ```
 */
export function getWorkspaceTypeIcon(type: string): LucideIcon {
    const iconName = WORKSPACE_TYPE_ICONS[type as keyof typeof WORKSPACE_TYPE_ICONS] ?? "Briefcase"
    return getIconComponent(iconName)
}

/**
 * Map of common workspace type icons (pre-resolved components)
 * Use this when you need the full mapping for iteration.
 */
export function getWorkspaceTypeIconMap(): Record<string, LucideIcon> {
    return {
        personal: getIconComponent("User"),
        organization: getIconComponent("Building2"),
        institution: getIconComponent("Landmark"),
        group: getIconComponent("Users"),
        family: getIconComponent("Heart"),
    }
}
