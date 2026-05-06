/**
 * Templates Registry (Level 5)
 * Auto-loads all template wrappers from subdirectories
 */

import type { TemplateWrapper } from "@/frontend/shared/foundation"

// ============================================================================
// Auto-Discovery Registry
// Note: import.meta.glob() not supported in Next.js, using empty registry
// ============================================================================

const registryModules: Record<string, { default: TemplateWrapper }> = {
  // TODO: Add template registries here when available
}

// ============================================================================
// Template Registry Map
// ============================================================================

export const templateRegistry = new Map<string, TemplateWrapper>()

// Populate registry from auto-discovered modules
for (const [path, module] of Object.entries(registryModules)) {
  const wrapper = module.default
  if (wrapper && wrapper.id) {
    templateRegistry.set(wrapper.id, wrapper)
  } else {
    console.warn(`?? Invalid template wrapper at ${path}`)
  }
}

// ============================================================================
// Registry Functions
// ============================================================================

export function getTemplateWrapper(id: string): TemplateWrapper | undefined {
  return templateRegistry.get(id)
}

export function getAllTemplateWrappers(): TemplateWrapper[] {
  return Array.from(templateRegistry.values())
}

// ============================================================================
// Register with Global Registry
// ============================================================================

export function registerAllTemplates(globalRegistry: any): void {
  for (const wrapper of getAllTemplateWrappers()) {
    try {
      globalRegistry.register({
        id: wrapper.id,
        type: "template" as const,
        wrapper,
        metadata: wrapper.metadata || {},
      })
    } catch (error) {
      console.error(`Failed to register template ${wrapper.id}:`, error)
    }
  }
}

// ============================================================================
// Debug
// ============================================================================

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__TEMPLATE_REGISTRY__ = {
    registry: templateRegistry,
    getAll: getAllTemplateWrappers,
    get: getTemplateWrapper,
  }
}
