/**
 * Group Operations
 * Create and manage groups of nodes
 */

import type { GroupNode, AnyNode } from "../../types"
import { EmptyGroupError, InvalidGroupOperationError } from "../../types"

// ============================================================================
// Create Group
// ============================================================================

export interface CreateGroupOptions {
  name?: string
  locked?: boolean
  collapsed?: boolean
}

export function createGroup(
  nodeIds: string[],
  options: CreateGroupOptions = {}
): GroupNode {
  // Validate
  if (nodeIds.length === 0) {
    throw new EmptyGroupError()
  }

  const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return {
    id: groupId,
    type: "group",
    name: options.name || `Group ${groupId.slice(-4)}`,
    children: nodeIds,
    locked: options.locked || false,
    collapsed: options.collapsed || false,
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  }
}

// ============================================================================
// Explode Group
// ============================================================================

export function explodeGroup(group: GroupNode): string[] {
  if (group.locked) {
    throw new InvalidGroupOperationError(
      "Cannot explode a locked group",
      group.id,
      "explode"
    )
  }

  return [...group.children]
}

// ============================================================================
// Add to Group
// ============================================================================

export function addToGroup(group: GroupNode, nodeIds: string[]): GroupNode {
  if (group.locked) {
    throw new InvalidGroupOperationError(
      "Cannot add nodes to a locked group",
      group.id,
      "add"
    )
  }

  return {
    ...group,
    children: [...group.children, ...nodeIds],
    metadata: {
      ...group.metadata,
      updatedAt: Date.now(),
    },
  }
}

// ============================================================================
// Remove from Group
// ============================================================================

export function removeFromGroup(group: GroupNode, nodeIds: string[]): GroupNode {
  if (group.locked) {
    throw new InvalidGroupOperationError(
      "Cannot remove nodes from a locked group",
      group.id,
      "remove"
    )
  }

  const nodeIdsSet = new Set(nodeIds)
  const newChildren = group.children.filter((id) => !nodeIdsSet.has(id))

  if (newChildren.length === 0) {
    throw new EmptyGroupError()
  }

  return {
    ...group,
    children: newChildren,
    metadata: {
      ...group.metadata,
      updatedAt: Date.now(),
    },
  }
}

// ============================================================================
// Lock/Unlock Group
// ============================================================================

export function lockGroup(group: GroupNode): GroupNode {
  return {
    ...group,
    locked: true,
    metadata: {
      ...group.metadata,
      updatedAt: Date.now(),
    },
  }
}

export function unlockGroup(group: GroupNode): GroupNode {
  return {
    ...group,
    locked: false,
    metadata: {
      ...group.metadata,
      updatedAt: Date.now(),
    },
  }
}

// ============================================================================
// Collapse/Expand Group
// ============================================================================

export function collapseGroup(group: GroupNode): GroupNode {
  return {
    ...group,
    collapsed: true,
    metadata: {
      ...group.metadata,
      updatedAt: Date.now(),
    },
  }
}

export function expandGroup(group: GroupNode): GroupNode {
  return {
    ...group,
    collapsed: false,
    metadata: {
      ...group.metadata,
      updatedAt: Date.now(),
    },
  }
}

// ============================================================================
// Rename Group
// ============================================================================

export function renameGroup(group: GroupNode, name: string): GroupNode {
  return {
    ...group,
    name,
    metadata: {
      ...group.metadata,
      updatedAt: Date.now(),
    },
  }
}

// ============================================================================
// Check if node is in group
// ============================================================================

export function isNodeInGroup(group: GroupNode, nodeId: string): boolean {
  return group.children.includes(nodeId)
}

// ============================================================================
// Get group size
// ============================================================================

export function getGroupSize(group: GroupNode): number {
  return group.children.length
}
