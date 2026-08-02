/**
 * Blocks Registry (Level 3)
 * Registry for block manifests (for builder integration)
 */

import type { BlockWrapper } from "@/frontend/shared/foundation"

// ============================================================================
// Block Registry Map
// ============================================================================

export const blockRegistry = new Map<string, BlockWrapper>()

// ============================================================================
// Registry Functions
// ============================================================================

export function registerBlock(wrapper: BlockWrapper): void {
  if (wrapper && wrapper.id) {
    blockRegistry.set(wrapper.id, wrapper)
  }
}

export function getBlockWrapper(id: string): BlockWrapper | undefined {
  return blockRegistry.get(id)
}

export function getAllBlockWrappers(): BlockWrapper[] {
  return Array.from(blockRegistry.values())
}

export function hasBlock(id: string): boolean {
  return blockRegistry.has(id)
}

// ============================================================================
// Register with Global Registry
// ============================================================================

export function registerAllBlocks(globalRegistry: any): void {
  for (const wrapper of getAllBlockWrappers()) {
    try {
      globalRegistry.register({
        id: wrapper.id,
        type: "block" as const,
        wrapper,
        metadata: wrapper.metadata || {},
      })
    } catch (error) {
      console.error(`Failed to register block ${wrapper.id}:`, error)
    }
  }
}

// ============================================================================
// Debug
// ============================================================================

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__BLOCK_REGISTRY__ = {
    registry: blockRegistry,
    getAll: getAllBlockWrappers,
    get: getBlockWrapper,
    register: registerBlock,
  }
}
