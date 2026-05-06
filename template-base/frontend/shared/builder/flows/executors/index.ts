/**
 * Node Executor Registry
 * 
 * Central registry combining all node executors.
 */

import type { NodeExecutorRegistry } from '../types';
import { triggerExecutors } from './triggers';
import { httpExecutors } from './http';
import { logicExecutors } from './logic';
import { dataExecutors } from './data';

// ============================================================================
// Combined Registry
// ============================================================================

/**
 * Default executor registry with all built-in executors
 */
export const defaultExecutors: NodeExecutorRegistry = {
    ...triggerExecutors,
    ...httpExecutors,
    ...logicExecutors,
    ...dataExecutors,
};

/**
 * Create a custom executor registry by extending the defaults
 */
export function createExecutorRegistry(
    customExecutors: NodeExecutorRegistry = {}
): NodeExecutorRegistry {
    return {
        ...defaultExecutors,
        ...customExecutors,
    };
}

/**
 * Get list of available executor types
 */
export function getAvailableExecutorTypes(): string[] {
    return Object.keys(defaultExecutors);
}

// ============================================================================
// Re-exports
// ============================================================================

export { triggerExecutors } from './triggers';
export { httpExecutors } from './http';
export { logicExecutors } from './logic';
export { dataExecutors } from './data';
