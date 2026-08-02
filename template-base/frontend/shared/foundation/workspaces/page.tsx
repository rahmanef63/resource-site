"use client"

import type { Id } from "@convex/_generated/dataModel";
import { WorkspaceSettings } from "@/frontend/shared/settings/workspace/WorkspaceSettings";

export interface WorkspacesPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function WorkspacesPage({ workspaceId }: WorkspacesPageProps) {
  return <WorkspaceSettings workspaceId={workspaceId as Id<"workspaces">} />;
}
