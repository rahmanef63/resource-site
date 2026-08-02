/**
 * Studio Registry - Unified Widget & Node Registry
 * 
 * Merges CMS Builder widgets, Smart Blocks, and Automation nodes
 * into a single registry for the unified Studio canvas.
 */

import type { ComponentConfig } from '@/frontend/shared/foundation';

// Import from the actual registries
import { cmsWidgetRegistry } from '../ui/widgets/registry';
import { registerAutomationNodes } from '../workflow/nodes/registry';

// Re-export the CMS widget registry
export { cmsWidgetRegistry };

// ============================================================================
// Unified Registry
// ============================================================================

/**
 * Register CMS components to the cross-feature registry
 */
function registerCMSComponents(registerComponent: (config: ComponentConfig) => void): void {
    Object.entries(cmsWidgetRegistry).forEach(([key, config]) => {
        if (config.hidden) return; // skip legacy/redundant widgets
        registerComponent({
            key,
            label: config.label,
            category: config.category,
            feature: 'builder',
            description: config.description,
            icon: config.icon,
            defaults: config.defaults,
            inspector: config.inspector as any,
        });
    });
}

/**
 * Register all studio components to the cross-feature registry
 */
export function registerStudioComponents(
    registerComponent: (config: ComponentConfig) => void
): void {
    // Register CMS components (UI widgets + blocks)
    registerCMSComponents(registerComponent);

    // Register Automation nodes
    registerAutomationNodes(registerComponent);
}

// ============================================================================
// Category Helpers
// ============================================================================

export type StudioComponentCategory =
    | 'Layout' | 'Content' | 'Media' | 'Form' | 'Navigation' | 'Action' | 'UI' | 'Templates' | 'Blocks'  // UI categories
    | 'Trigger' | 'HTTP' | 'Data' | 'Logic' | 'Integration' | 'AI' | 'Error';  // Automation categories

export const UI_CATEGORIES: StudioComponentCategory[] = [
    'Layout', 'Content', 'Media', 'Form', 'Navigation', 'Action', 'UI', 'Templates', 'Blocks'
];

export const AUTOMATION_CATEGORIES: StudioComponentCategory[] = [
    'Trigger', 'HTTP', 'Data', 'Logic', 'Integration', 'AI', 'Error'
];

/**
 * Check if a category belongs to UI (Builder) components
 */
export function isUICategory(category: string): boolean {
    return UI_CATEGORIES.includes(category as StudioComponentCategory);
}

/**
 * Check if a category belongs to Automation components
 */
export function isAutomationCategory(category: string): boolean {
    return AUTOMATION_CATEGORIES.includes(category as StudioComponentCategory);
}

// ============================================================================
// Mode-based Filtering
// ============================================================================

export type StudioMode = 'ui' | 'workflow' | 'unified';

/**
 * Get categories visible for a given mode
 */
export function getCategoriesForMode(mode: StudioMode): StudioComponentCategory[] {
    switch (mode) {
        case 'ui':
            return UI_CATEGORIES;
        case 'workflow':
            return AUTOMATION_CATEGORIES;
        case 'unified':
        default:
            return [...UI_CATEGORIES, ...AUTOMATION_CATEGORIES];
    }
}
