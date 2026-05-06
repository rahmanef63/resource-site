/**
 * Template Helpers
 * 
 * DRY utilities for creating template nodes and edges
 */

import type { TemplateNode, TemplateEdge } from './types';

// Default vertical spacing between nodes
const NODE_SPACING = 150;
const NODE_X = 250;

/**
 * Create a node with auto-positioned Y based on index
 */
export function createNode(
    id: string,
    type: string,
    category: string,
    props: Record<string, any> = {},
    index: number = 0
): TemplateNode {
    return {
        id,
        position: { x: NODE_X, y: 50 + (index * NODE_SPACING) },
        data: {
            type,
            category,
            props,
        },
    };
}

/**
 * Create edge between two nodes
 */
export function createEdge(source: string, target: string, id?: string): TemplateEdge {
    return {
        id: id || `e-${source}-${target}`,
        source,
        target,
    };
}

/**
 * Create a chain of edges from an array of node IDs
 */
export function createEdgeChain(nodeIds: string[]): TemplateEdge[] {
    const edges: TemplateEdge[] = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
        edges.push(createEdge(nodeIds[i], nodeIds[i + 1]));
    }
    return edges;
}

// ============================================================================
// Pre-configured Node Builders (DRY)
// ============================================================================

export const nodes = {
    // Triggers
    webhook: (id: string, path: string, method = 'POST', index = 0) =>
        createNode(id, 'webhook', 'Trigger', { path, method }, index),

    schedule: (id: string, cron: string, description: string, index = 0) =>
        createNode(id, 'schedule', 'Trigger', { cronExpression: cron, description }, index),

    eventTrigger: (id: string, eventType: string, index = 0) =>
        createNode(id, 'event', 'Trigger', { eventType }, index),

    manual: (id: string, index = 0) =>
        createNode(id, 'manual', 'Trigger', {}, index),

    // HTTP
    httpRequest: (id: string, method: string, url: string, headers = '{}', index = 0) =>
        createNode(id, 'httpRequest', 'HTTP', { method, url, headers }, index),

    httpRespond: (id: string, status: number, body: string, index = 0) =>
        createNode(id, 'httpRespond', 'HTTP', { status, body }, index),

    // Calendar
    calendarCreate: (id: string, props: Record<string, any>, index = 0) =>
        createNode(id, 'feature.calendar.create', 'Integration', props, index),

    calendarGet: (id: string, operation: string, props: Record<string, any> = {}, index = 0) =>
        createNode(id, 'feature.calendar.get', 'Integration', { operation, ...props }, index),

    calendarUpdate: (id: string, eventId: string, props: Record<string, any> = {}, index = 0) =>
        createNode(id, 'feature.calendar.update', 'Integration', { eventId, ...props }, index),

    calendarDelete: (id: string, eventId: string, index = 0) =>
        createNode(id, 'feature.calendar.delete', 'Integration', { eventId, confirmDelete: true }, index),

    // Logic
    ifCondition: (id: string, condition: string, index = 0) =>
        createNode(id, 'if', 'Logic', { condition }, index),

    loop: (id: string, items: string, index = 0) =>
        createNode(id, 'loop', 'Logic', { items }, index),

    // AI
    openai: (id: string, prompt: string, model = 'gpt-4o-mini', index = 0) =>
        createNode(id, 'openai', 'AI', { model, prompt }, index),

    claude: (id: string, prompt: string, model = 'claude-3-haiku', index = 0) =>
        createNode(id, 'claude', 'AI', { model, prompt }, index),

    // Integrations
    slack: (id: string, channel: string, message: string, index = 0) =>
        createNode(id, 'slack', 'Integration', { channel, message }, index),

    email: (id: string, to: string, subject: string, body: string, index = 0) =>
        createNode(id, 'email', 'Integration', { to, subject, body }, index),

    database: (id: string, operation: string, props: Record<string, any> = {}, index = 0) =>
        createNode(id, 'database', 'Integration', { operation, ...props }, index),

    // Data
    code: (id: string, code: string, index = 0) =>
        createNode(id, 'code', 'Data', { code }, index),

    setVariable: (id: string, name: string, value: string, index = 0) =>
        createNode(id, 'setVariable', 'Data', { name, value }, index),
};
