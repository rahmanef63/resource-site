/**
 * Global Create Action Registry
 *
 * Allows features to register "Create" actions (e.g., New Document, New Project)
 * that appear in the global "+" menu.
 */

import { LucideIcon } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"

export interface CreateAction {
    id: string
    label: string
    description?: string
    icon: LucideIcon
    order?: number
    shortcut?: string
    /**
     * Action handler.
     */
    onClick: () => void
    /**
     * If true, this action is context-aware and depends on the active route.
     */
    isContextAware?: boolean
}

const createActions = new Map<string, CreateAction[]>()

/**
 * Register create actions for a feature
 */
export function registerCreateActions(featureSlug: string, actions: CreateAction[]) {
    if (createActions.has(featureSlug)) {
        console.warn(`⚠️ Create actions for "${featureSlug}" already registered, overwriting...`)
    }
    createActions.set(featureSlug, actions)
}

/**
 * Unregister create actions
 */
export function unregisterCreateActions(featureSlug: string) {
    createActions.delete(featureSlug)
}

/**
 * Get all registered create actions, sorted by order
 */
export function getAllCreateActions(): CreateAction[] {
    const allActions = Array.from(createActions.values()).flat()
    return allActions.sort((a, b) => (a.order || 999) - (b.order || 999))
}

export function clearCreateRegistry() {
    createActions.clear()
}
