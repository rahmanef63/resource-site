import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import type { Id } from "@convex/_generated/dataModel";

/**
 * Workspace Context API Hooks
 *
 * Provides React hooks for interacting with workspace context data.
 */

/**
 * Get workspace context data
 */
export const useWorkspaceContext = (workspaceId: Id<"workspaces"> | null | undefined) => {
  return useQuery(
    api["features/knowledge/api/workspaceContext"].getWorkspaceContext,
    workspaceId ? { workspaceId } : undefined
  );
};

/**
 * Update workspace context mutation
 */
export const useUpdateWorkspaceContext = () => {
  return useMutation(
    api["features/knowledge/api/workspaceContext"].updateWorkspaceContext
  );
};

/**
 * Get workspace context formatted for AI consumption
 */
export const useWorkspaceContextForAI = (workspaceId: Id<"workspaces"> | null | undefined) => {
  return useQuery(
    api["features/knowledge/api/workspaceContext"].getWorkspaceContextForAI,
    workspaceId ? { workspaceId } : undefined
  );
};

export interface WorkspaceContextData {
  teamOverview?: string;
  projectContext?: string;
  goalsObjectives?: string;
  skills?: string;
  processes?: string;
  tools?: string;
  communication?: string;
}
