/**
 * Template Registry
 * 
 * Dynamic collection of all workflow templates.
 * New templates are automatically included when modules are added.
 */

import type { WorkflowTemplate, TemplateCategory } from './types';

// Import template modules
import { calendarTemplates } from './calendar';
import { dataTemplates } from './data';
import { integrationTemplates } from './integration';

// ============================================================================
// Dynamic Template Collection
// ============================================================================

/**
 * All workflow templates - auto-collected from modules
 */
export const workflowTemplates: WorkflowTemplate[] = [
    ...calendarTemplates,
    ...dataTemplates,
    ...integrationTemplates,
];

// ============================================================================
// Template Helpers
// ============================================================================

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): WorkflowTemplate[] {
    return workflowTemplates.filter(t => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): WorkflowTemplate | undefined {
    return workflowTemplates.find(t => t.id === id);
}

/**
 * Search templates by name or tags
 */
export function searchTemplates(query: string): WorkflowTemplate[] {
    const q = query.toLowerCase();
    return workflowTemplates.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
    );
}

/**
 * Get available categories with counts
 */
export function getTemplateCategoryCounts(): Record<TemplateCategory, number> {
    const counts: Record<string, number> = {};
    workflowTemplates.forEach(t => {
        counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts as Record<TemplateCategory, number>;
}

// ============================================================================
// Re-exports
// ============================================================================

export type { WorkflowTemplate, TemplateNode, TemplateEdge, TemplateCategory } from './types';
export { createNode, createEdge, createEdgeChain, nodes } from './helpers';
