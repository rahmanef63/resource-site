import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import type { Id } from "@convex/_generated/dataModel";

// ============================================================================
// Members API
// ============================================================================

export const useMembers = (
    workspaceId: Id<"workspaces">,
    options?: { includeInactive?: boolean }
) => useQuery((api.workspace.workspaces as any).getMembers, { workspaceId, includeInactive: options?.includeInactive });

export const useRemoveMember = () => useMutation((api.workspace.workspaces as any).removeMember);
export const useUpdateMemberRole = () => useMutation((api.workspace.workspaces as any).updateMemberRole);

// ============================================================================
// Roles API
// ============================================================================

export const useRoles = (workspaceId: Id<"workspaces">) =>
    useQuery(api.workspace.roles.getAllRoles, { workspaceId });

export const useCreateRole = () => useMutation(api.workspace.roles.createRole);
export const useUpdateRole = () => useMutation(api.workspace.roles.updateRole);
export const useDeleteRole = () => useMutation(api.workspace.roles.deleteRole);

export const useHasPermission = (
    workspaceId: Id<"workspaces">,
    permission: string
) => useQuery(api.workspace.roles.hasPermission, { workspaceId, permission });
