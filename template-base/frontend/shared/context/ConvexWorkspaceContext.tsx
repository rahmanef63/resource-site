import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider";

type WorkspaceSummary = {
  _id: Id<"workspaces">;
  name: string;
  type?: string;
};

export interface ConvexWorkspaceContextValue {
  workspaces: WorkspaceSummary[] | undefined;
  currentWorkspace: WorkspaceSummary | null;
  currentWorkspaceId: Id<"workspaces"> | null;
  setWorkspaceId: (id: Id<"workspaces"> | null) => void;
  currentUser: Doc<"users"> | null;
  isLoading: boolean;
}

export function useConvexWorkspaceContext(): ConvexWorkspaceContextValue {
  const { workspaceId, setWorkspaceId, workspaces } = useWorkspaceContext();

  const currentWorkspace = useMemo(() => {
    if (!workspaces || !workspaceId) return null;
    return (
      workspaces.find((workspace) => workspace._id === workspaceId) ?? null
    );
  }, [workspaces, workspaceId]);

  const currentUser = useQuery(api.user.users.current) as Doc<"users"> | null;

  return {
    workspaces,
    currentWorkspace,
    currentWorkspaceId: workspaceId,
    setWorkspaceId,
    currentUser,
    isLoading: typeof workspaces === "undefined",
  };
}
