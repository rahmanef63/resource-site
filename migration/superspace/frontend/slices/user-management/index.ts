/**
 * User Management Feature
 * 
 * Unified user management that composes existing systems:
 * - Members (workspaceMemberships)
 * - Invitations (invitations)
 * - Contacts (contacts)
 * - Teams (userTeams)
 * - Role Hierarchy (roleHierarchyLinks)
 * 
 * @module frontend/slices/user-management
 */

// API Hooks
export {
  useContactsForQuickInvite,
  useBulkInviteContacts,
  // Re-exported from existing features
  useRoles,
  useContacts,
} from "./api";

// Types
export type {
  UserInfo,
  MemberWithRole,
  RoleInfo,
  RoleNode,
  RoleLink,
  RoleHierarchy,
  Team,
  TeamMember,
  HierarchyInvitation,
  PropagationStrategy,
  InviteToHierarchyParams,
  BulkInviteContactsParams,
  WorkspaceInfo,
  AccessMatrixEntry,
  AccessMatrix,
  RoleBreakdown,
  HierarchyMemberOverview,
  ContactForQuickInvite,
  UserManagementTab,
  UserManagementState,
  UserManagementFilters,
} from "./types";

// Config
export { default as userManagementConfig } from "./config";
