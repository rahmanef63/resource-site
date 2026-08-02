/**
 * Flows Registry (Level 6)
 * Auto-loads all flow wrappers from subdirectories
 */

import type { FlowWrapper } from "@/frontend/shared/foundation"

// ============================================================================
// Auto-Discovery Registry
// Note: import.meta.glob() not supported in Next.js, using empty registry
// ============================================================================

const registryModules: Record<string, { default: FlowWrapper }> = {
  // TODO: Add flow registries here when available
}

// ============================================================================
// Flow Registry Map
// ============================================================================

export const flowRegistry = new Map<string, FlowWrapper>()

// Populate registry from auto-discovered modules
for (const [path, module] of Object.entries(registryModules)) {
  const wrapper = module.default
  if (wrapper && wrapper.id) {
    flowRegistry.set(wrapper.id, wrapper)
  } else {
    console.warn(`?? Invalid flow wrapper at ${path}`)
  }
}

// ============================================================================
// Registry Functions
// ============================================================================

export function getFlowWrapper(id: string): FlowWrapper | undefined {
  return flowRegistry.get(id)
}

export function getAllFlowWrappers(): FlowWrapper[] {
  return Array.from(flowRegistry.values())
}

// ============================================================================
// Register with Global Registry
// ============================================================================

export function registerAllFlows(globalRegistry: any): void {
  for (const wrapper of getAllFlowWrappers()) {
    try {
      globalRegistry.register({
        id: wrapper.id,
        type: "flow" as const,
        wrapper,
        metadata: wrapper.metadata || {},
      })
    } catch (error) {
      console.error(`Failed to register flow ${wrapper.id}:`, error)
    }
  }
}

// ============================================================================
// Debug
// ============================================================================

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__FLOW_REGISTRY__ = {
    registry: flowRegistry,
    getAll: getAllFlowWrappers,
    get: getFlowWrapper,
  }
}
