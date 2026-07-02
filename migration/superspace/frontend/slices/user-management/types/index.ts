/**
 * User Management Types
 * 
 * Type definitions for the unified user management feature
 */

import type { Id } from "@convex/_generated/dataModel";
import type { Timestamped } from "../../../shared/types";

// ============================================================================
// User & Member Types
// ============================================================================

export interface UserInfo {
  _id: Id<"users">;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface MemberWithRole {
  _id: Id<"workspaceMemberships">;
  userId: Id<"users">;
  workspaceId: Id<"workspaces">;
  roleId: Id<"roles">;
  status: "active" | "inactive" | "pending";
  joinedAt: number;
  user?: UserInfo | null;
  role?: RoleInfo | null;
}

// ============================================================================
// Role Types
// ============================================================================

export interface RoleInfo {
  _id: Id<"roles">;
  name: string;
  slug: string;
  level?: number;
  color?: string;
  permissions: string[];
  isSystemRole?: boolean;
  isDefault?: boolean;
}

export interface RoleNode {
  id: string;
  name: string;
  slug: string;
  level: number;
  color?: string;
  permissions: string[];
  isSystemRole?: boolean;
  isDefault?: boolean;
  position: { x: number; y: number };
}

export interface RoleLink {
  id: string;
  source: string;
  target: string;
  inheritanceMode: "full" | "restrict" | "extend";
}

export interface RoleHierarchy {
  roles: RoleNode[];
  links: RoleLink[];
}

// ============================================================================
// Team Types
// ============================================================================

export interface Team {
  _id: Id<"userTeams">;
  name: string;
  slug: string;
  description?: string;
  workspaceId: Id<"workspaces">;
  color?: string;
  icon?: string;
  memberCount?: number;
}

export interface TeamMember {
  _id: Id<"teamMemberships">;
  teamId: Id<"userTeams">;
  userId: Id<"users">;
  role: "leader" | "member";
  joinedAt: number;
  user?: UserInfo | null;
}

// ============================================================================
// Invitation Types
// ============================================================================

export interface HierarchyInvitation extends Timestamped {
  _id: Id<"hierarchyInvitations">;
  sourceWorkspaceId: Id<"workspaces">;
  inviterId: Id<"users">;
  inviteeEmail: string;
  inviteeId?: Id<"users">;
  propagationStrategy: "same" | "per_level" | "decreasing";
  baseRoleId?: Id<"roles">;
  targetWorkspaceIds: Id<"workspaces">[];
  status: "pending" | "partial" | "completed" | "cancelled";
  completedAt?: number;
  message?: string;
}

export type PropagationStrategy = "same" | "decreasing";

export interface InviteToHierarchyParams {
  workspaceId: Id<"workspaces">;
  inviteeEmail: string;
  baseRoleId: Id<"roles">;
  propagateToChildren: boolean;
  propagationStrategy: PropagationStrategy;
  maxDepth?: number;
  message?: string;
}

export interface BulkInviteContactsParams {
  workspaceId: Id<"workspaces">;
  ContactIds: Id<"users">[];
  roleId: Id<"roles">;
  message?: string;
}

// ============================================================================
// Access Matrix Types
// ============================================================================

export interface WorkspaceInfo {
  _id: Id<"workspaces">;
  name: string;
  slug: string;
  type: string;
  depth: number;
  parentWorkspaceId?: Id<"workspaces">;
}

export interface AccessMatrixEntry {
  roleId: string;
  roleName?: string;
  roleLevel?: number;
}

export interface AccessMatrix {
  users: UserInfo[];
  workspaces: WorkspaceInfo[];
  matrix: Record<string, Record<string, AccessMatrixEntry>>;
}

// ============================================================================
// Member Overview Types
// ============================================================================

export interface RoleBreakdown {
  count: number;
  roleName: string;
  level?: number;
}

export interface HierarchyMemberOverview {
  workspaceId: Id<"workspaces">;
  workspaceName: string;
  totalMembers: number;
  roleBreakdown: RoleBreakdown[];
  pendingInvitations: number;
  childWorkspaces: number;
  linkedWorkspaces: number;
}

// ============================================================================
// Quick Invite Types
// ============================================================================

export interface ContactForQuickInvite {
  _id: Id<"users">;
  name?: string;
  email?: string;
  avatarUrl?: string;
  hasPendingInvite: boolean;
}

// ============================================================================
// UI State Types
// ============================================================================

export type UserManagementTab = "team" | "matrix" | "invite" | "roles";

export interface UserManagementState {
  activeTab: UserManagementTab;
  selectedUserId?: Id<"users">;
  selectedTeamId?: Id<"userTeams">;
  isInviteModalOpen: boolean;
  isTeamModalOpen: boolean;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface UserManagementFilters {
  search: string;
  roleFilter?: Id<"roles">;
  statusFilter?: "active" | "inactive" | "pending";
  workspaceFilter?: Id<"workspaces">;
}
