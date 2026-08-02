/**
 * Shared Block Utilities
 *
 * Common types, utilities, and components for all blocks.
 */

import { ROLE_COLORS as CANONICAL_ROLE_COLORS } from "@/frontend/shared/constants/colors"

// ============================================================================
// Common Types
// ============================================================================

export interface BaseBlockProps {
    className?: string
    loading?: boolean
}

export interface BlockHeaderProps {
    title: string
    description?: string
    icon?: React.ComponentType<{ className?: string }>
    action?: React.ReactNode
}

export interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>
    title: string
    description?: string
    action?: React.ReactNode
}

// ============================================================================
// Color Mappings
// ============================================================================

export const TYPE_COLORS = {
    // Activity types
    document: "bg-purple-100 text-purple-600 dark:bg-purple-900/20",
    task: "bg-green-100 text-green-600 dark:bg-green-900/20",
    message: "bg-blue-100 text-blue-600 dark:bg-blue-900/20",
    member: "bg-orange-100 text-orange-600 dark:bg-orange-900/20",
    settings: "bg-gray-100 text-gray-600 dark:bg-gray-900/20",
    general: "bg-primary/10 text-primary",
    event: "bg-orange-100 text-orange-600 dark:bg-orange-900/20",
    contact: "bg-pink-100 text-pink-600 dark:bg-pink-900/20",
    other: "bg-gray-100 text-gray-600 dark:bg-gray-900/20",
} as const

export const URGENCY_COLORS = {
    overdue: { badge: "bg-red-100 text-red-600", dot: "bg-red-500" },
    today: { badge: "bg-orange-100 text-orange-600", dot: "bg-orange-500" },
    soon: { badge: "bg-yellow-100 text-yellow-600", dot: "bg-yellow-500" },
    upcoming: { badge: "bg-blue-100 text-blue-600", dot: "bg-blue-500" },
    later: { badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
} as const

export const ROLE_COLORS = CANONICAL_ROLE_COLORS

// ============================================================================
// Helper Functions
// ============================================================================

export function getTypeColor(type: string): string {
    return TYPE_COLORS[type as keyof typeof TYPE_COLORS] || TYPE_COLORS.other
}

export function getRoleColor(role: string): string {
    const normalizedRole = role.toLowerCase()
    return ROLE_COLORS[normalizedRole as keyof typeof ROLE_COLORS] || "bg-gray-400"
}

export function getUrgencyStyle(urgency: keyof typeof URGENCY_COLORS) {
    return URGENCY_COLORS[urgency]
}
