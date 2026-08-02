import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import type { WorkspaceMemberSummary } from "../types";


// Workspaces API hooks
export const useWorkspacesApi = () => {
  // Queries
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces);
  
  // Mutations
  const createWorkspace = useMutation(api.workspace.workspaces.createWorkspace);
  // Note: updateWorkspace, deleteWorkspace, joinWorkspace, leaveWorkspace need to be implemented

  return {
    // Data
    userWorkspaces,
    
    // Actions
    createWorkspace,
  };
};

// Members API hooks - Note: These functions need to be implemented
export const useMembersApi = () => {
  const addMember = async (..._args: unknown[]) => {
    throw new Error("addMember is not available in workspace.workspaces API. Use invitations flow.");
  };
  const removeMember = useMutation(api.workspace.workspaces.removeMember);
  const updateMemberRole = useMutation(api.workspace.workspaces.updateMemberRole);

  return {
    addMember,
    removeMember,
    updateMemberRole,
  };
};

// Individual hooks
export const useUserWorkspaces = () => useQuery(api.workspace.workspaces.getUserWorkspaces);
export const useWorkspace = (workspaceId: Id<"workspaces">) => 
  useQuery(api.workspace.workspaces.getWorkspace, { workspaceId });
export const useWorkspaceMembers = (workspaceId: Id<"workspaces"> | null | undefined) =>
  useQuery(
    api.workspace.workspaces.getWorkspaceMembers,
    workspaceId ? { workspaceId } : "skip"
  ) as WorkspaceMemberSummary[] | undefined;
export const useWorkspaceRoles = (workspaceId: Id<"workspaces">) => 
  useQuery(api.workspace.roles.getAllRoles, { workspaceId });

export const useCreateWorkspace = () => useMutation(api.workspace.workspaces.createWorkspace);
// export const useJoinWorkspace = () => useMutation(api.workspaces.joinWorkspace);

// Convenience member mutation hooks
export const useAddMember = () => async (..._args: unknown[]) => {
  throw new Error("addMember is not available in workspace.workspaces API. Use invitations flow.");
};
export const useRemoveMember = () => useMutation(api.workspace.workspaces.removeMember);
export const useUpdateMemberRole = () => useMutation(api.workspace.workspaces.updateMemberRole);
