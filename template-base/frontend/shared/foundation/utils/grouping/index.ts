/**
 * Grouping Module Index
 */

export * from "./group"
export * from "./component-instance"

// Re-export for convenience
export {
  createGroup,
  explodeGroup,
  addToGroup,
  removeFromGroup,
  lockGroup,
  unlockGroup,
  collapseGroup,
  expandGroup,
  renameGroup,
  isNodeInGroup,
  getGroupSize,
} from "./group"

export {
  createComponentDefinition,
  createComponentInstance,
  detachInstance,
  updateInstanceOverrides,
  updateComponentDefinition,
  getInstancesOfDefinition,
  isInstanceDetached,
} from "./component-instance"
