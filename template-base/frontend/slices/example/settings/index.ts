/**
 * ============================================================================
 * EXAMPLE FEATURE - settings/index.ts
 * ============================================================================
 * 
 * Feature Settings Exports
 * 
 * WHY THIS IS REQUIRED:
 * Every feature should have configurable settings that:
 * - Persist per workspace
 * - Are accessible via the Settings UI
 * - Have sensible defaults
 * 
 * PATTERN:
 * 1. Define settings schema with Zod
 * 2. Create a custom hook for storage (useXxxSettings)
 * 3. Create UI components for editing (XxxSettings.tsx)
 * 4. Export everything from index.ts
 * 
 * For this minimal example, we export placeholder values.
 * See frontend/slices/crm/settings/ for a complete implementation.
 */

// =========================================================================
// DEFAULT SETTINGS
// =========================================================================

/**
 * Default settings for the Example feature
 * 
 * These are used when:
 * - User hasn't configured the feature yet
 * - Settings are reset to defaults
 */
export const DEFAULT_EXAMPLE_SETTINGS = {
    /** Show welcome banner on first visit */
    showWelcome: true,
    
    /** Number of items to show per page */
    itemsPerPage: 10,
    
    /** Default sort order */
    sortOrder: 'newest' as const,
    
    /** Enable sound effects */
    soundEnabled: false,
}

// =========================================================================
// TYPES
// =========================================================================

/**
 * TypeScript type derived from defaults
 */
export type ExampleSettingsSchema = typeof DEFAULT_EXAMPLE_SETTINGS

// =========================================================================
// HOOKS (Placeholder)
// =========================================================================

/**
 * Hook to access and update Example settings
 * 
 * In a full implementation, this would:
 * 1. Read from Zustand/Jotai store
 * 2. Sync with Convex for persistence
 * 3. Provide update functions
 * 
 * For now, returns static defaults.
 */
export function useExampleSettings() {
    // TODO: Implement with Zustand/Jotai + Convex sync
    // See: frontend/slices/crm/settings/useCRMSettings.ts
    
    return {
        settings: DEFAULT_EXAMPLE_SETTINGS,
        updateSettings: (_updates: Partial<ExampleSettingsSchema>) => {
            console.warn("[example] Settings update not implemented in example feature")
        },
        resetToDefaults: () => {
            console.warn("[example] Settings reset not implemented in example feature")
        },
    }
}

// =========================================================================
// COMPONENTS (Placeholder)
// =========================================================================

/**
 * Settings UI component
 * 
 * In a full implementation, this would render:
 * - Form fields for each setting
 * - Save/Reset buttons
 * - Validation feedback
 * 
 * For now, exports a placeholder.
 * See: frontend/slices/crm/settings/CRMSettings.tsx
 */
export function ExampleSettings() {
    // TODO: Implement settings UI
    return null
}
