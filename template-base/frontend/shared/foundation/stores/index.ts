/**
 * Shared Foundation Stores
 * 
 * Reusable store patterns and utilities for feature stores
 */

// Store factory
export { createFeatureStore, createSimpleStore, createSelectors } from "./createFeatureStore"

// Tree utilities
export {
  buildTree,
  flattenTree,
  getAncestorIds,
  getDescendantIds,
  wouldCreateCycle,
  calculateNewPath,
  calculateNewDepth,
  calculateSortOrder,
  normalizeSortOrders,
  createInitialTreeState,
  toggleExpanded,
  toggleSelected,
  filterTreeItems,
  getExpandedIdsForSearch,
} from "./treeUtils"

// Types
export type {
  TreeNode,
  FlatTreeItem,
  TreeState,
  DragItem,
  DropPosition,
  DnDState,
  DnDResult,
  BaseStoreItem,
  HierarchicalStoreItem,
  IconItem,
  ColorItem,
  CRUDActions,
  TreeActions,
  SearchActions,
  BaseStoreState,
  TreeStoreState,
  FeatureStoreOptions,
  TreeStoreOptions,
} from "./types"
