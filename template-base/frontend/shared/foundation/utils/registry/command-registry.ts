/**
 * Global Command Registry
 *
 * Allows features to register commands for the Cmd+K menu.
 */

import { LucideIcon } from "lucide-react"

export type CommandGroup = "navigation" | "actions" | "settings" | "theme" | "other" | "danger"

export interface CommandDefinition {
    id: string
    label: string
    icon?: LucideIcon
    shortcut?: string
    group?: CommandGroup | string
    keywords?: string[]
    description?: string
    priority?: number
    variant?: "default" | "destructive"
    action: () => void
}

const commands = new Map<string, CommandDefinition[]>()

/**
 * Register commands for a feature
 */
export function registerCommands(featureSlug: string, newCommands: CommandDefinition[]) {
    const existing = commands.get(featureSlug) || []
    commands.set(featureSlug, [...existing, ...newCommands])
}

/**
 * Unregister commands
 */
export function unregisterCommands(featureSlug: string) {
    commands.delete(featureSlug)
}

/**
 * Get all registered commands
 */
export function getAllCommands(): CommandDefinition[] {
    const allCommands = Array.from(commands.values()).flat()
    return allCommands.sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

/**
 * Get commands for a specific feature
 */
export function getCommandsForFeature(featureSlug: string): CommandDefinition[] {
    return commands.get(featureSlug) || []
}

export function clearCommandRegistry() {
    commands.clear()
}
