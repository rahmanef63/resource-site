/**
 * Shared Constants - SINGLE SOURCE OF TRUTH
 * 
 * Central exports for all shared constants.
 * Import from here, don't create new definitions elsewhere!
 * 
 * @module frontend/shared/constants
 */

// Colors
export * from "./colors";
export { ROLE_COLORS, getRoleColor } from "./colors";

// Workspace Types (matches Convex schema)
export {
  type WorkspaceType,
  type WorkspaceTypeConfig,
  WORKSPACE_TYPES,
  WORKSPACE_TYPE_OPTIONS,
  WORKSPACE_TYPE_LABELS,
  WORKSPACE_TYPE_ICONS,
  WORKSPACE_TYPE_DESCRIPTIONS,
  isValidWorkspaceType,
  getWorkspaceTypeConfig,
} from "./workspace-types";
