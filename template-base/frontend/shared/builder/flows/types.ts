/**
 * Flow Execution Engine Types
 * 
 * Types for the visual workflow execution system.
 * Reusable across automation, workflows, and any visual builder feature.
 */

// ============================================================================
// Flow Definition Types
// ============================================================================

export interface FlowNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
        type: string;
        props: Record<string, any>;
        label?: string;
        category?: string;
        feature?: string;
        metadata?: Record<string, any>;
    };
}

export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    data?: {
        order?: number;
        label?: string;
        condition?: string;
    };
}

export interface FlowDefinition {
    id: string;
    name: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    metadata?: Record<string, any>;
}

// ============================================================================
// Execution Context Types
// ============================================================================

export interface ExecutionContext {
    /** Data passed between nodes */
    data: Record<string, any>;
    /** Metadata about execution (trigger info, conditions, etc.) */
    meta: Record<string, any>;
    /** Accumulated logs */
    logs: ExecutionLog[];
    /** Variables set by nodes */
    variables: Record<string, any>;
}

export interface ExecutionLog {
    timestamp: number;
    nodeId?: string;
    nodeLabel?: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
}

// ============================================================================
// Execution Result Types
// ============================================================================

export type ExecutionStatus =
    | 'idle'
    | 'validating'
    | 'running'
    | 'success'
    | 'failed'
    | 'cancelled';

export interface ExecutionStep {
    nodeId: string;
    nodeType: string;
    nodeLabel: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startedAt?: number;
    finishedAt?: number;
    duration?: number;
    input?: any;
    output?: any;
    error?: string;
}

export interface ExecutionResult {
    id: string;
    status: ExecutionStatus;
    startedAt: number;
    finishedAt?: number;
    duration?: number;
    steps: ExecutionStep[];
    context: ExecutionContext;
    error?: string;
    output?: any;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationError {
    type: 'error' | 'warning';
    message: string;
    nodeId?: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

// ============================================================================
// Node Executor Types
// ============================================================================

export interface NodeExecutorInput {
    node: FlowNode;
    context: ExecutionContext;
    flow: FlowDefinition;
    signal?: AbortSignal;
}

export interface NodeExecutorOutput {
    /** Updated context data */
    data?: Record<string, any>;
    /** Updated metadata */
    meta?: Record<string, any>;
    /** Whether to continue execution */
    continue?: boolean;
    /** Output for this node */
    output?: any;
    /** Error message if failed */
    error?: string;
}

export type NodeExecutor = (input: NodeExecutorInput) => Promise<NodeExecutorOutput>;

export interface NodeExecutorRegistry {
    [nodeType: string]: NodeExecutor;
}

// ============================================================================
// Execution Callbacks
// ============================================================================

export interface ExecutionCallbacks {
    /** Called when a step starts */
    onStepStart?: (step: ExecutionStep) => void;
    /** Called when a step completes */
    onStepComplete?: (step: ExecutionStep) => void;
    /** Called when a log is added */
    onLog?: (log: ExecutionLog) => void;
    /** Called when status changes */
    onStatusChange?: (status: ExecutionStatus) => void;
}

// ============================================================================
// Engine Options
// ============================================================================

export interface ExecutionOptions {
    /** Initial context data */
    initialData?: Record<string, any>;
    /** Abort signal for cancellation */
    signal?: AbortSignal;
    /** Delay between steps (ms) for visualization */
    stepDelay?: number;
    /** Callbacks */
    callbacks?: ExecutionCallbacks;
    /** Max execution time (ms) */
    timeout?: number;
}
