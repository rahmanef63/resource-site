/**
 * User Management Page
 * 
 * Standalone page for user management feature
 */

"use client";

import type { Id } from "@convex/_generated/dataModel";
import { Users } from "lucide-react";
import { UserManagementPanel } from "./components/UserManagementPanel";
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell";

export interface UserManagementPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function UserManagementPage({ workspaceId }: UserManagementPageProps) {
  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Select a workspace to manage users
          </p>
        </div>
      </div>
    );
  }

  return (
    <FeatureShell featureId="user-management" padding={false}>
      <UserManagementPanel
        workspaceId={workspaceId}
        className="h-full p-6"
      />
    </FeatureShell>
  );
}
