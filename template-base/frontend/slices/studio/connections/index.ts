/**
 * Studio Connections Module
 * 
 * Provides edge types and utilities for connecting:
 * - Automation nodes → UI blocks (data binding)
 * - UI blocks → Automation triggers (event binding)
 */

export { DataBindingEdge, type DataBindingEdgeData } from './DataBindingEdge';
export { EventBindingEdge, type EventBindingEdgeData } from './EventBindingEdge';

import { DataBindingEdge } from './DataBindingEdge';
import { EventBindingEdge } from './EventBindingEdge';
import type { EdgeTypes } from 'reactflow';

/**
 * Custom edge types for the Studio canvas
 */
export const studioEdgeTypes: EdgeTypes = {
    dataBinding: DataBindingEdge,
    eventBinding: EventBindingEdge,
};

/**
 * Utility to create a data binding edge
 */
export function createDataBinding(
    sourceId: string,
    targetId: string,
    sourceProperty: string,
    targetProperty: string,
    transform?: string
) {
    return {
        id: `data-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        type: 'dataBinding',
        data: {
            sourceProperty,
            targetProperty,
            transform,
            label: `${sourceProperty} → ${targetProperty}`,
        },
    };
}

/**
 * Utility to create an event binding edge
 */
export function createEventBinding(
    sourceId: string,
    targetId: string,
    eventType: 'click' | 'submit' | 'change' | 'focus' | 'blur' | 'hover' = 'click'
) {
    return {
        id: `event-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        type: 'eventBinding',
        data: {
            eventType,
            label: `on${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`,
        },
    };
}

/**
 * Check if a node is a UI component (from Builder)
 */
export function isUINode(nodeType: string): boolean {
    return nodeType === 'shadcnNode';
}

/**
 * Check if a node is an automation component
 */
export function isAutomationNode(nodeType: string): boolean {
    return nodeType === 'automationNode';
}

/**
 * Validate if a connection is valid
 * - Data binding: Automation → UI
 * - Event binding: UI → Automation
 */
export function validateConnection(
    sourceType: string,
    targetType: string,
    edgeType: 'dataBinding' | 'eventBinding'
): boolean {
    if (edgeType === 'dataBinding') {
        // Data flows from automation to UI
        return isAutomationNode(sourceType) && isUINode(targetType);
    }
    if (edgeType === 'eventBinding') {
        // Events flow from UI to automation
        return isUINode(sourceType) && isAutomationNode(targetType);
    }
    return false;
}
