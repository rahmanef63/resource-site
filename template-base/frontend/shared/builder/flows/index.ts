/**
 * Flows Module
 * 
 * Visual workflow execution system. Provides:
 * - Flow validation and execution engine
 * - Pluggable node executors
 * - Execution types and callbacks
 */

// ============================================================================
// Registry (existing)
// ============================================================================
export * from "./registry"

// ============================================================================
// Types
// ============================================================================
export type {
    FlowNode,
    FlowEdge,
    FlowDefinition,
    ExecutionContext,
    ExecutionLog,
    ExecutionStatus,
    ExecutionStep,
    ExecutionResult,
    ValidationError,
    ValidationResult,
    NodeExecutor,
    NodeExecutorRegistry,
    NodeExecutorInput,
    NodeExecutorOutput,
    ExecutionCallbacks,
    ExecutionOptions,
} from './types'

// ============================================================================
// Engine
// ============================================================================
export {
    uid,
    deepClone,
    getByPath,
    merge,
    sleep,
    validateFlow,
    topoSort,
    executeFlow,
    FlowEngine,
} from './engine'

// ============================================================================
// Executors
// ============================================================================
export {
    defaultExecutors,
    createExecutorRegistry,
    getAvailableExecutorTypes,
    triggerExecutors,
    httpExecutors,
    logicExecutors,
    dataExecutors,
} from './executors'

// ============================================================================
// UI Components
// ============================================================================
export { ExecutionControls } from './ExecutionControls'
export type { ExecutionControlsProps } from './ExecutionControls'
export { ExecutionPanel } from './ExecutionPanel'
export type { ExecutionPanelProps } from './ExecutionPanel'

