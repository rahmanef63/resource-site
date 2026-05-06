import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { api as apiUntyped } from "@/frontend/shared/foundation/utils/convex/any-api";
import { Id } from "@convex/_generated/dataModel";
import { useWorkspaceMembers } from "../api";

export function useWorkspaceData(workspaceId: Id<"workspaces">) {
  const workspace = useQuery(api.workspace.workspaces.getWorkspace, { workspaceId });
  const members = useWorkspaceMembers(workspaceId);
  const documents = useQuery(apiUntyped["features/docs/documents"].getWorkspaceDocuments, { workspaceId });

  return {
    workspace,
    members,
    documents,
    isLoading: workspace === undefined || members === undefined || documents === undefined,
  };
}
