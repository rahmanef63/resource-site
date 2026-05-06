/**
 * Elements Registry
 * Level 2 - Composite elements
 * Auto-loads all element wrappers from subdirectories
 */

import type { ElementWrapper } from "@/frontend/shared/foundation"

// ============================================================================
// Auto-Discovery Registry
// Note: import.meta.glob() not supported in Next.js, using empty registry
// ============================================================================

const registryModules: Record<string, { default: ElementWrapper }> = {
  // TODO: Add element registries here when available
}

// ============================================================================
// Element Registry Map
// ============================================================================

export const elementRegistry = new Map<string, ElementWrapper>()

// Populate registry from auto-discovered modules
for (const [path, module] of Object.entries(registryModules)) {
  const wrapper = module.default
  if (wrapper && wrapper.id) {
    elementRegistry.set(wrapper.id, wrapper)
  } else {
    console.warn(`?? Invalid element wrapper at ${path}`)
  }
}

// ============================================================================
// Registry Functions
// ============================================================================

export function getElementWrapper(id: string): ElementWrapper | undefined {
  return elementRegistry.get(id)
}

export function getAllElementWrappers(): ElementWrapper[] {
  return Array.from(elementRegistry.values())
}

export function getElementsByCategory(category: string): ElementWrapper[] {
  return getAllElementWrappers().filter((wrapper) => wrapper.category === category)
}

// ============================================================================
// Register with Global Registry
// ============================================================================

export function registerAllElements(globalRegistry: any): void {
  for (const wrapper of getAllElementWrappers()) {
    try {
      globalRegistry.register({
        id: wrapper.id,
        type: "element" as const,
        wrapper,
        metadata: wrapper.metadata || {},
      })
    } catch (error) {
      console.error(`Failed to register element ${wrapper.id}:`, error)
    }
  }
}

// ============================================================================
// Debug
// ============================================================================

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__ELEMENT_REGISTRY__ = {
    registry: elementRegistry,
    getAll: getAllElementWrappers,
    get: getElementWrapper,
  }
}
