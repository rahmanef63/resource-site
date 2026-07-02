"use client";

import type { Id } from "@convex/_generated/dataModel";
import TasksPage from "./views/TasksPage";

export interface TasksPageProps {
  workspaceId: Id<"workspaces"> | null;
}

export default function Page({ workspaceId }: TasksPageProps) {
  return <TasksPage workspaceId={workspaceId} />;
}
