/**
 * Flow Execution Engine
 * 
 * Core engine that validates and executes visual workflow definitions.
 * Supports pluggable node executors for different node types.
 */

import type {
    FlowDefinition,
    FlowNode,
    FlowEdge,
    ExecutionContext,
    ExecutionResult,
    ExecutionStep,
    ExecutionStatus,
    ExecutionLog,
    ExecutionOptions,
    ValidationResult,
    ValidationError,
    NodeExecutorRegistry,
} from './types';

// ============================================================================
// Utilities
// ============================================================================

/** Generate unique ID */
export const uid = (prefix = 'id'): string =>
    `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

/** Deep clone object */
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/** Get value from object by dot-notation path */
export const getByPath = (obj: any, path: string): any => {
    const parts = (path || '').split('.').filter(Boolean);
    let current = obj;
    for (const part of parts) {
        if (current == null) return undefined;
        current = current[part];
    }
    return current;
};

/** Merge objects deeply */
export const merge = (target: any, source: any): any => {
    if (typeof target !== 'object' || target === null) return source;
    if (typeof source !== 'object' || source === null) return source;
    const result = Array.isArray(target) ? [...target] : { ...target };
    for (const key of Object.keys(source)) {
        result[key] = merge(result[key], source[key]);
    }
    return result;
};

/** Sleep for ms */
export const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate a flow definition before execution
 */
export function validateFlow(flow: FlowDefinition): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check for empty flow
    if (flow.nodes.length === 0) {
        errors.push({ type: 'error', message: 'Workflow is empty. Add at least one node.' });
        return { valid: false, errors, warnings };
    }

    // Check for trigger nodes
    const triggers = flow.nodes.filter(n =>
        n.data.type?.startsWith('trigger.') ||
        n.type?.startsWith('trigger.')
    );
    if (triggers.length === 0) {
        errors.push({ type: 'error', message: 'Workflow needs at least one Trigger node to start.' });
    }

    // Build adjacency maps
    const incomingCount = new Map<string, number>();
    const outgoingCount = new Map<string, number>();
    flow.nodes.forEach(n => {
        incomingCount.set(n.id, 0);
        outgoingCount.set(n.id, 0);
    });
    flow.edges.forEach(e => {
        incomingCount.set(e.target, (incomingCount.get(e.target) || 0) + 1);
        outgoingCount.set(e.source, (outgoingCount.get(e.source) || 0) + 1);
    });

    // Check for disconnected nodes (non-triggers without inputs)
    flow.nodes.forEach(n => {
        const nodeType = n.data.type || n.type;
        const isTrigger = nodeType?.startsWith('trigger.');
        const incoming = incomingCount.get(n.id) || 0;

        if (!isTrigger && incoming === 0) {
            errors.push({
                type: 'error',
                message: `Node "${n.data.label || nodeType}" has no incoming connections.`,
                nodeId: n.id,
            });
        }
    });

    // Check for cycles using DFS
    const adj = new Map<string, string[]>();
    flow.nodes.forEach(n => adj.set(n.id, []));
    flow.edges.forEach(e => adj.get(e.source)?.push(e.target));

    const temp = new Set<string>();
    const perm = new Set<string>();
    let hasCycle = false;

    const visit = (id: string): void => {
        if (perm.has(id)) return;
        if (temp.has(id)) {
            hasCycle = true;
            return;
        }
        temp.add(id);
        for (const next of adj.get(id) || []) {
            visit(next);
        }
        temp.delete(id);
        perm.add(id);
    };

    flow.nodes.forEach(n => visit(n.id));

    if (hasCycle) {
        errors.push({ type: 'error', message: 'Workflow contains a cycle (loop). Cycles are not supported.' });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

// ============================================================================
// Topological Sort
// ============================================================================

/**
 * Topologically sort nodes starting from triggers
 */
export function topoSort(flow: FlowDefinition): string[] {
    const adj = new Map<string, string[]>();
    const indegree = new Map<string, number>();

    flow.nodes.forEach(n => {
        adj.set(n.id, []);
        indegree.set(n.id, 0);
    });

    flow.edges.forEach(e => {
        adj.get(e.source)?.push(e.target);
        indegree.set(e.target, (indegree.get(e.target) || 0) + 1);
    });

    // Start from triggers or nodes with no incoming edges
    const queue: string[] = [];
    flow.nodes.forEach(n => {
        const nodeType = n.data.type || n.type;
        const isTrigger = nodeType?.startsWith('trigger.');
        const deg = indegree.get(n.id) || 0;

        if (isTrigger || deg === 0) {
            queue.push(n.id);
        }
    });

    const order: string[] = [];
    const localIndegree = new Map(indegree);
    const visited = new Set<string>();

    while (queue.length > 0) {
        const id = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        order.push(id);

        for (const next of adj.get(id) || []) {
            localIndegree.set(next, (localIndegree.get(next) || 0) - 1);
            if ((localIndegree.get(next) || 0) <= 0 && !visited.has(next)) {
                queue.push(next);
            }
        }
    }

    // Add any remaining nodes not in order (disconnected)
    flow.nodes.forEach(n => {
        if (!order.includes(n.id)) {
            order.push(n.id);
        }
    });

    return order;
}

// ============================================================================
// Execution Engine
// ============================================================================

/**
 * Execute a flow definition
 */
export async function executeFlow(
    flow: FlowDefinition,
    executors: NodeExecutorRegistry,
    options: ExecutionOptions = {}
): Promise<ExecutionResult> {
    const {
        initialData = {},
        signal,
        stepDelay = 150,
        callbacks = {},
        timeout = 60000,
    } = options;

    const executionId = uid('exec');
    const startedAt = Date.now();

    // Initialize context
    const context: ExecutionContext = {
        data: deepClone(initialData),
        meta: {},
        logs: [],
        variables: {},
    };

    // Initialize result
    const result: ExecutionResult = {
        id: executionId,
        status: 'running',
        startedAt,
        steps: [],
        context,
    };

    // Helper to add log
    const addLog = (log: Omit<ExecutionLog, 'timestamp'>): void => {
        const fullLog = { ...log, timestamp: Date.now() };
        context.logs.push(fullLog);
        callbacks.onLog?.(fullLog);
    };

    // Update status
    const setStatus = (status: ExecutionStatus): void => {
        result.status = status;
        callbacks.onStatusChange?.(status);
    };

    try {
        // Validate first
        const validation = validateFlow(flow);
        if (!validation.valid) {
            addLog({ level: 'error', message: 'Validation failed' });
            validation.errors.forEach(e => addLog({ level: 'error', message: e.message, nodeId: e.nodeId }));
            setStatus('failed');
            result.error = validation.errors.map(e => e.message).join('; ');
            result.finishedAt = Date.now();
            result.duration = result.finishedAt - result.startedAt;
            return result;
        }

        // Get execution order
        const order = topoSort(flow);
        addLog({ level: 'info', message: `Execution plan: ${order.length} nodes` });

        // Timeout handling
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Execution timeout')), timeout);
        });

        // Execute nodes in order
        for (const nodeId of order) {
            // Check for cancellation
            if (signal?.aborted) {
                setStatus('cancelled');
                addLog({ level: 'warn', message: 'Execution cancelled by user' });
                break;
            }

            const node = flow.nodes.find(n => n.id === nodeId);
            if (!node) continue;

            const nodeType = node.data.type || node.type;
            const nodeLabel = node.data.label || nodeType;

            // Create step
            const step: ExecutionStep = {
                nodeId,
                nodeType,
                nodeLabel,
                status: 'running',
                startedAt: Date.now(),
            };
            result.steps.push(step);
            callbacks.onStepStart?.(step);

            addLog({
                level: 'info',
                message: `Executing: ${nodeLabel}`,
                nodeId,
                nodeLabel,
            });

            // Add delay for visualization
            if (stepDelay > 0) {
                await sleep(stepDelay);
            }

            // Find executor
            const executor = executors[nodeType];
            if (!executor) {
                addLog({
                    level: 'warn',
                    message: `No executor for node type: ${nodeType}`,
                    nodeId,
                    nodeLabel,
                });
                step.status = 'skipped';
                step.finishedAt = Date.now();
                step.duration = step.finishedAt - (step.startedAt ?? step.finishedAt);
                callbacks.onStepComplete?.(step);
                continue;
            }

            try {
                // Execute node with timeout
                const execPromise = executor({
                    node,
                    context,
                    flow,
                    signal,
                });

                const output = await Promise.race([execPromise, timeoutPromise]);

                // Update context
                if (output.data !== undefined) {
                    context.data = merge(context.data, output.data);
                }
                if (output.meta !== undefined) {
                    context.meta = merge(context.meta, output.meta);
                }

                step.output = output.output;
                step.status = 'completed';
                step.finishedAt = Date.now();
                step.duration = step.finishedAt - (step.startedAt ?? step.finishedAt);

                addLog({
                    level: 'info',
                    message: `Completed: ${nodeLabel} (${step.duration}ms)`,
                    nodeId,
                    nodeLabel,
                    data: output.output,
                });

                callbacks.onStepComplete?.(step);

                // Check if we should continue
                if (output.continue === false) {
                    addLog({ level: 'info', message: 'Execution stopped by node' });
                    break;
                }

                // Stop at respond nodes
                if (nodeType === 'respond') {
                    result.output = output.output;
                    break;
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);

                step.status = 'failed';
                step.error = errorMessage;
                step.finishedAt = Date.now();
                step.duration = step.finishedAt - (step.startedAt ?? step.finishedAt);

                addLog({
                    level: 'error',
                    message: `Failed: ${nodeLabel} - ${errorMessage}`,
                    nodeId,
                    nodeLabel,
                });

                callbacks.onStepComplete?.(step);

                // Stop execution on error
                setStatus('failed');
                result.error = errorMessage;
                break;
            }
        }

        // Finalize result
        if (result.status === 'running') {
            setStatus('success');
            addLog({ level: 'info', message: 'Execution completed successfully' });
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setStatus('failed');
        result.error = errorMessage;
        addLog({ level: 'error', message: `Execution error: ${errorMessage}` });
    }

    result.finishedAt = Date.now();
    result.duration = result.finishedAt - result.startedAt;

    return result;
}

// ============================================================================
// Export
// ============================================================================

export const FlowEngine = {
    uid,
    deepClone,
    getByPath,
    merge,
    sleep,
    validateFlow,
    topoSort,
    executeFlow,
};

export default FlowEngine;
