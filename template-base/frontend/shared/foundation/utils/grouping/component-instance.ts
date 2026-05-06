/**
 * Component Instance Operations
 * Create reusable components with instances
 */

import type { ComponentDefinition, ComponentInstance, AnyNode } from "../../types"
import { ComponentInstanceError } from "../../types"

// ============================================================================
// Create Component Definition
// ============================================================================

export interface CreateComponentDefinitionOptions {
  name?: string
  description?: string
}

export function createComponentDefinition(
  nodeIds: string[],
  options: CreateComponentDefinitionOptions = {}
): ComponentDefinition {
  if (nodeIds.length === 0) {
    throw new ComponentInstanceError(
      "Cannot create component from empty selection",
      `definition-${Date.now()}`
    )
  }

  const definitionId = `component-def-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return {
    id: definitionId,
    type: "component-definition",
    name: options.name || `Component ${definitionId.slice(-4)}`,
    children: nodeIds,
    props: {}, // Extract props that can be overridden
    metadata: {
      description: options.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  }
}

// ============================================================================
// Create Component Instance
// ============================================================================

export interface CreateComponentInstanceOptions {
  name?: string
  overrides?: Record<string, any>
}

export function createComponentInstance(
  definitionId: string,
  options: CreateComponentInstanceOptions = {}
): ComponentInstance {
  const instanceId = `component-inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return {
    id: instanceId,
    type: "component-instance",
    name: options.name || `Instance ${instanceId.slice(-4)}`,
    definitionId,
    overrides: options.overrides || {},
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  }
}

// ============================================================================
// Detach Instance (convert to regular nodes)
// ============================================================================

export function detachInstance(
  instance: ComponentInstance,
  definition: ComponentDefinition,
  nodes: Record<string, AnyNode>
): string[] {
  // Clone the nodes from the definition
  const clonedNodeIds: string[] = []

  for (const nodeId of definition.children) {
    const node = nodes[nodeId]
    if (node) {
      const clonedId = `${nodeId}-clone-${Date.now()}`
      clonedNodeIds.push(clonedId)

      // Apply overrides if any
      // (In real implementation, this would clone and merge props)
    }
  }

  return clonedNodeIds
}

// ============================================================================
// Update Instance Overrides
// ============================================================================

export function updateInstanceOverrides(
  instance: ComponentInstance,
  overrides: Record<string, any>
): ComponentInstance {
  return {
    ...instance,
    overrides: {
      ...instance.overrides,
      ...overrides,
    },
    metadata: {
      ...instance.metadata,
      updatedAt: Date.now(),
    },
  }
}

// ============================================================================
// Update Component Definition
// ============================================================================

export function updateComponentDefinition(
  definition: ComponentDefinition,
  nodeIds: string[]
): ComponentDefinition {
  return {
    ...definition,
    children: nodeIds,
    metadata: {
      ...definition.metadata,
      updatedAt: Date.now(),
    },
  }
}

// ============================================================================
// Get all instances of a definition
// ============================================================================

export function getInstancesOfDefinition(
  definitionId: string,
  allNodes: Record<string, AnyNode>
): ComponentInstance[] {
  const instances: ComponentInstance[] = []

  for (const node of Object.values(allNodes)) {
    if (node.type === "component-instance" && node.definitionId === definitionId) {
      instances.push(node as ComponentInstance)
    }
  }

  return instances
}

// ============================================================================
// Check if instance is detached
// ============================================================================

export function isInstanceDetached(
  instance: ComponentInstance,
  definitions: Record<string, ComponentDefinition>
): boolean {
  return !definitions[instance.definitionId]
}
