'use client';

/**
 * Automation Execution Hook
 * 
 * Connects the flow execution engine to the automation canvas.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { useSharedCanvas } from '@/frontend/shared/builder';
import {
    validateFlow,
    executeFlow,
    defaultExecutors,
    type FlowDefinition,
    type FlowNode,
    type ExecutionResult,
    type ExecutionStatus,
    type ExecutionLog,
    type ExecutionStep,
    type ValidationResult,
    type ExecutionCallbacks,
} from '@/frontend/shared/builder/flows';

// ============================================================================
// Types
// ============================================================================

export interface UseAutomationExecutionReturn {
    // State
    status: ExecutionStatus;
    validationResult: ValidationResult | undefined;
    result: ExecutionResult | null;
    logs: ExecutionLog[];
    steps: ExecutionStep[];

    // Actions
    validate: () => ValidationResult;
    run: () => Promise<ExecutionResult | null>;
    stop: () => void;
    clearLogs: () => void;
    exportFlow: () => void;
    importFlow: (json: string) => boolean;
    clearFlow: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useAutomationExecution(): UseAutomationExecutionReturn {
    const { nodes, edges, setNodes, setEdges } = useSharedCanvas();

    // Execution state
    const [status, setStatus] = useState<ExecutionStatus>('idle');
    const [validationResult, setValidationResult] = useState<ValidationResult>();
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [logs, setLogs] = useState<ExecutionLog[]>([]);
    const [steps, setSteps] = useState<ExecutionStep[]>([]);

    // Abort controller for cancellation
    const abortControllerRef = useRef<AbortController | null>(null);

    // Convert canvas state to flow definition
    const flowDefinition = useMemo((): FlowDefinition => {
        const flowNodes: FlowNode[] = nodes.map(node => ({
            id: node.id,
            type: node.type || 'unknown',
            position: node.position,
            data: {
                type: node.data?.type || node.type || 'unknown',
                props: node.data?.props || {},
                label: node.data?.props?.label || node.data?.type || node.type || 'Node',
                category: node.data?.category,
                feature: node.data?.feature,
                metadata: node.data?.metadata,
            },
        }));

        return {
            id: 'current-flow',
            name: 'Automation Flow',
            nodes: flowNodes,
            edges: edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                data: e.data,
            })),
        };
    }, [nodes, edges]);

    // Validate flow
    const validate = useCallback((): ValidationResult => {
        setStatus('validating');
        const validationResult = validateFlow(flowDefinition);
        setValidationResult(validationResult);
        setStatus(validationResult.valid ? 'idle' : 'idle');

        // Add validation logs
        if (validationResult.valid) {
            setLogs(prev => [...prev, {
                timestamp: Date.now(),
                level: 'info',
                message: '✅ Validation passed',
            }]);
        } else {
            validationResult.errors.forEach(err => {
                setLogs(prev => [...prev, {
                    timestamp: Date.now(),
                    level: 'error',
                    message: `❌ ${err.message}`,
                    nodeId: err.nodeId,
                }]);
            });
        }

        return validationResult;
    }, [flowDefinition]);

    // Run flow
    const run = useCallback(async (): Promise<ExecutionResult | null> => {
        // Validate first
        const validation = validate();
        if (!validation.valid) {
            return null;
        }

        // Create abort controller
        abortControllerRef.current = new AbortController();

        // Clear previous results
        setSteps([]);
        setLogs(prev => [...prev, {
            timestamp: Date.now(),
            level: 'info',
            message: '▶ Starting execution...',
        }]);

        try {
            setStatus('running');

            // Client-side execution provides instant feedback without a backend roundtrip.
            // Backend persistence (createWorkflowMutation / executeWorkflowMutation) is handled
            // by the Deploy/Save flow outside this hook — workspaceId will be injected there.

            const executionResult = await executeFlow(
                flowDefinition,
                defaultExecutors,
                {
                    signal: abortControllerRef.current.signal,
                    stepDelay: 200,
                    callbacks: {
                        onStatusChange: (newStatus) => {
                            setStatus(newStatus);
                        },
                        onStepStart: (step) => {
                            setSteps(prev => [...prev, step]);
                        },
                        onStepComplete: (step) => {
                            setSteps(prev => prev.map(s =>
                                s.nodeId === step.nodeId ? step : s
                            ));
                        },
                        onLog: (log) => {
                            setLogs(prev => [...prev, log]);
                        },
                    },
                }
            );

            setResult(executionResult);
            setStatus(executionResult.status);

            return executionResult;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setLogs(prev => [...prev, {
                timestamp: Date.now(),
                level: 'error',
                message: `Execution error: ${errorMessage}`,
            }]);
            setStatus('failed');
            return null;
        }
    }, [flowDefinition, validate]);

    // Stop execution
    const stop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setStatus('cancelled');
        setLogs(prev => [...prev, {
            timestamp: Date.now(),
            level: 'warn',
            message: '⏹ Execution cancelled',
        }]);
    }, []);

    // Clear logs
    const clearLogs = useCallback(() => {
        setLogs([]);
        setSteps([]);
        setResult(null);
        setValidationResult(undefined);
        setStatus('idle');
    }, []);

    // Export flow as JSON
    const exportFlow = useCallback(() => {
        const exportData = {
            flow: flowDefinition,
            exportedAt: new Date().toISOString(),
        };
        const json = JSON.stringify(exportData, null, 2);

        // Copy to clipboard
        navigator.clipboard.writeText(json).catch(() => { });

        // Download file
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `automation-flow-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        setLogs(prev => [...prev, {
            timestamp: Date.now(),
            level: 'info',
            message: '📋 Flow exported to JSON',
        }]);
    }, [flowDefinition]);

    // Import flow from JSON
    const importFlow = useCallback((json: string): boolean => {
        try {
            const parsed = JSON.parse(json);
            const flow = parsed.flow || parsed;

            if (!flow.nodes || !flow.edges) {
                throw new Error('Invalid flow format: missing nodes or edges');
            }

            // Convert back to canvas format
            const canvasNodes = flow.nodes.map((n: FlowNode) => ({
                id: n.id,
                type: 'automationNode',
                position: n.position,
                data: n.data,
            }));

            setNodes(canvasNodes);
            setEdges(flow.edges);

            setLogs(prev => [...prev, {
                timestamp: Date.now(),
                level: 'info',
                message: `📥 Imported flow with ${flow.nodes.length} nodes`,
            }]);

            return true;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setLogs(prev => [...prev, {
                timestamp: Date.now(),
                level: 'error',
                message: `Import failed: ${errorMessage}`,
            }]);
            return false;
        }
    }, [setNodes, setEdges]);

    // Clear flow
    // Clear flow by resetting nodes and edges
    const clearFlow = useCallback(() => {
        setNodes([]);
        setEdges([]);
        clearLogs();
    }, [setNodes, setEdges, clearLogs]);

    return {
        status,
        validationResult,
        result,
        logs,
        steps,
        validate,
        run,
        stop,
        clearLogs,
        exportFlow,
        importFlow,
        clearFlow,
    };
}
