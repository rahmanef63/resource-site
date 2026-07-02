/**
 * User Management API Hooks
 * 
 * Consolidated hooks for members, roles, invitations, and user management.
 * This module is self-contained and does not depend on archives-features.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import type { Id } from "@convex/_generated/dataModel";

// ============================================================================
// Members & Roles API (Core)
// ============================================================================
import {
  useCreateRole,
  useUpdateRole,
  useDeleteRole
} from "./memberHooks";

export * from "./memberHooks";

// Placeholder for search members if backend function doesn't exist
export const useSearchMembers = (
  workspaceId: Id<"workspaces">,
  query: string,
  options?: {
    status?: "active" | "inactive" | "pending";
    roleId?: Id<"roles">;
    limit?: number;
  }
) => undefined;

// ============================================================================
// Contacts API (re-exported from contact feature)
// ============================================================================

export {
  useContacts,
  usePendingContactRequests,
  useSentContactRequests,
  useSendContactRequest,
  useAcceptContactRequest,
  useDeclineContactRequest,
  useRemoveContact,
} from "@/frontend/slices/contacts";

// ============================================================================
// Invitations API (previously from archives-features/invitations)
// ============================================================================

// Invitations combined hook
export const useInvitationsApi = () => {
  const receivedInvitations = useQuery(api.workspace.invitations.getUserInvitations, { type: "received" });
  const sentInvitations = useQuery(api.workspace.invitations.getUserInvitations, { type: "sent" });

  const sendInvitation = useMutation(api.workspace.invitations.sendWorkspaceInvitation);
  const acceptInvitation = useMutation(api.workspace.invitations.acceptInvitation);
  const declineInvitation = useMutation(api.workspace.invitations.declineInvitation);
  const cancelInvitation = useMutation(api.workspace.invitations.cancelInvitation);
  const resendInvitation = useMutation(api.workspace.invitations.resendInvitation);
  const sendBulkInvitations = useMutation(api.workspace.invitations.sendBulkInvitations);
  const cleanupExpiredInvitations = useMutation(api.workspace.invitations.cleanupExpiredInvitations);

  return {
    receivedInvitations,
    sentInvitations,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    resendInvitation,
    sendBulkInvitations,
    cleanupExpiredInvitations,
  };
};

// Individual invitation hooks
export const useReceivedInvitations = () => useQuery(api.workspace.invitations.getUserInvitations, { type: "received" });
export const useSentInvitations = () => useQuery(api.workspace.invitations.getUserInvitations, { type: "sent" });

export const useSendInvitation = () => useMutation(api.workspace.invitations.sendWorkspaceInvitation);
export const useAcceptInvitation = () => useMutation(api.workspace.invitations.acceptInvitation);
export const useDeclineInvitation = () => useMutation(api.workspace.invitations.declineInvitation);
export const useCancelInvitation = () => useMutation(api.workspace.invitations.cancelInvitation);
export const useResendInvitation = () => useMutation(api.workspace.invitations.resendInvitation);
export const useSendBulkInvitations = () => useMutation(api.workspace.invitations.sendBulkInvitations);
export const useCleanupExpiredInvitations = () => useMutation(api.workspace.invitations.cleanupExpiredInvitations);

// Workspace-specific invitation hooks
export const useWorkspaceInvitations = (
  workspaceId: Id<"workspaces">,
  status?: "pending" | "accepted" | "declined" | "expired"
) => useQuery(api.workspace.invitations.getWorkspaceInvitations, { workspaceId, status });

export const useInvitationStats = (workspaceId: Id<"workspaces">) =>
  useQuery(api.workspace.invitations.getInvitationStats, { workspaceId });

export const useSearchInvitations = (
  workspaceId: Id<"workspaces">,
  query: string,
  status?: "pending" | "accepted" | "declined" | "expired",
  limit?: number
) => useQuery(api.workspace.invitations.searchInvitations, { workspaceId, query, status, limit });

// ============================================================================
// New User Management Queries
// ============================================================================

/**
 * Get user→workspace access matrix for a workspace hierarchy
 */
export const useUserWorkspaceMatrix = (
  workspaceId: Id<"workspaces"> | undefined,
  maxDepth?: number
) => {
  return useQuery(
    api["features/userManagement/api/queries"].getUserWorkspaceMatrix,
    workspaceId ? { workspaceId, maxDepth } : "skip"
  );
};

/**
 * Get hierarchy member overview for a workspace
 */
export const useHierarchyMemberOverview = (
  workspaceId: Id<"workspaces"> | undefined
) => {
  return useQuery(
    api["features/userManagement/api/queries"].getHierarchyMemberOverview,
    workspaceId ? { workspaceId } : "skip"
  );
};

/**
 * Get Contacts available for quick invite to workspace
 */
export const useContactsForQuickInvite = (
  workspaceId: Id<"workspaces"> | undefined
) => {
  return useQuery(
    api["features/userManagement/api/queries"].getContactsForQuickInvite,
    workspaceId ? { workspaceId } : "skip"
  );
};

/**
 * Get teams for a workspace
 */
export const useWorkspaceTeams = (
  workspaceId: Id<"workspaces"> | undefined
) => {
  return useQuery(
    api["features/userManagement/api/queries"].getWorkspaceTeams,
    workspaceId ? { workspaceId } : "skip"
  );
};

/**
 * Get team members
 */
export const useTeamMembers = (
  teamId: Id<"userTeams"> | undefined
) => {
  return useQuery(
    api["features/userManagement/api/queries"].getTeamMembers,
    teamId ? { teamId } : "skip"
  );
};

/**
 * Get role hierarchy for ReactFlow canvas
 */
export const useRoleHierarchy = (
  workspaceId: Id<"workspaces"> | undefined
) => {
  return useQuery(
    api["features/userManagement/api/queries"].getRoleHierarchy,
    workspaceId ? { workspaceId } : "skip"
  );
};

// ============================================================================
// New User Management Mutations
// ============================================================================

/**
 * Invite user to workspace hierarchy
 */
export const useInviteToHierarchy = () => {
  return useMutation(
    api["features/userManagement/api/mutations"].inviteToHierarchy
  );
};

/**
 * Bulk invite Contacts to workspace
 */
export const useBulkInviteContacts = () => {
  return useMutation(
    api["features/userManagement/api/mutations"].bulkInviteContacts
  );
};

/**
 * Create a user team
 */
export const useCreateTeam = () => {
  return useMutation(
    api["features/userManagement/api/mutations"].createTeam
  );
};

/**
 * Add member to team
 */
export const useAddTeamMember = () => {
  return useMutation(
    api["features/userManagement/api/mutations"].addTeamMember
  );
};

/**
 * Remove member from team
 */
export const useRemoveTeamMember = () => {
  return useMutation(
    api["features/userManagement/api/mutations"].removeTeamMember
  );
};

/**
 * Invite entire team to workspace(s)
 */
export const useInviteTeamToWorkspaces = () => {
  return useMutation(
    api["features/userManagement/api/mutations"].inviteTeamToWorkspaces
  );
};

/**
 * Create role hierarchy link
 */
export const useCreateRoleHierarchyLink = () => {
  return useMutation(
    api["features/userManagement/api/mutations"].createRoleHierarchyLink
  );
};

/**
 * Delete role hierarchy link
 */
export const useDeleteRoleHierarchyLink = () => {
  return useMutation(
    api["features/userManagement/api/mutations"].deleteRoleHierarchyLink
  );
};

// ============================================================================
// Composite Hook - Full User Management API
// ============================================================================

/**
 * Unified hook for all user management operations
 */
export const useUserManagementApi = (workspaceId: Id<"workspaces"> | undefined) => {
  // Queries
  const matrix = useUserWorkspaceMatrix(workspaceId);
  const overview = useHierarchyMemberOverview(workspaceId);
  const ContactsForInvite = useContactsForQuickInvite(workspaceId);
  const teams = useWorkspaceTeams(workspaceId);
  const roleHierarchy = useRoleHierarchy(workspaceId);

  // Mutations
  const inviteToHierarchy = useInviteToHierarchy();
  const bulkInviteContacts = useBulkInviteContacts();
  const createTeam = useCreateTeam();
  const addTeamMember = useAddTeamMember();
  const removeTeamMember = useRemoveTeamMember();
  const inviteTeamToWorkspaces = useInviteTeamToWorkspaces();
  const createRoleHierarchyLink = useCreateRoleHierarchyLink();
  const deleteRoleHierarchyLink = useDeleteRoleHierarchyLink();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  return {
    // Data
    matrix,
    overview,
    ContactsForInvite,
    teams,
    roleHierarchy,

    // Actions
    inviteToHierarchy,
    bulkInviteContacts,
    createTeam,
    addTeamMember,
    removeTeamMember,
    inviteTeamToWorkspaces,
    createRoleHierarchyLink,
    deleteRoleHierarchyLink,
    createRole,
    updateRole,
    deleteRole,
  };
};
