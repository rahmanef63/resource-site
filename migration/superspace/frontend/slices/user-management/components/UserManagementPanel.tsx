/**
 * UserManagementPanel
 *
 * Main panel component for unified user management.
 * Provides tabs for:
 * - Members: Simple list view (Default)
 * - Explorer: Advanced Tree View for Roles/Access
 * - Teams: Team management
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Shield,
  LayoutList
} from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import type { UserManagementTab } from "../types";
import { useHierarchyMemberOverview, useWorkspaceTeams } from "../api";
import { PendingInvitationsCard } from "@/frontend/shared/ui/components/invitations/PendingInvitationsCard";
import { PendingContactRequestsCard } from "@/frontend/shared/ui/components/invitations/PendingContactRequestsCard";

// Sub-components
import { MembersListPanel } from "./MembersListPanel";
import { RoleExplorerPanel } from "./RoleExplorerPanel";
import { TeamListPanel } from "./TeamListPanel";

interface UserManagementPanelProps {
  workspaceId: Id<"workspaces">;
  className?: string;
  defaultTab?: UserManagementTab;
  onTabChange?: (tab: UserManagementTab) => void;
}

// Extending UserManagementTab type locally if needed, assuming it's a string union
// but for safety casting to string for Tabs value

export function UserManagementPanel({
  workspaceId,
  className,
  defaultTab = "members" as any, // Default to members
  onTabChange,
}: UserManagementPanelProps) {
  const [activeTab, setActiveTab] = React.useState<string>(defaultTab);

  const overview = useHierarchyMemberOverview(workspaceId);
  const teams = useWorkspaceTeams(workspaceId);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value as UserManagementTab);
  };

  const totalMembers = overview?.totalMembers ?? 0;
  const teamCount = teams?.length ?? 0;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage members, roles, and access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {totalMembers} members
          </Badge>
        </div>
      </div>

      <PendingInvitationsCard
        id="pending-invitations"
        className="mb-4"
        title="Your Invitations"
        description="Accept or decline invitations you have received before managing team access."
      />

      <PendingContactRequestsCard
        id="pending-contact-requests"
        className="mb-4"
      />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full justify-evenly mb-4 bg-muted/50 p-1">
          <TabsTrigger value="members" className="gap-2">
            <LayoutList className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="explorer" className="gap-2">
            <Shield className="w-4 h-4" />
            Role Explorer
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            Teams
            {teamCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4">
                {teamCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="members" className="h-full m-0">
            <MembersListPanel workspaceId={workspaceId} />
          </TabsContent>

          <TabsContent value="explorer" className="h-full m-0">
            <RoleExplorerPanel workspaceId={workspaceId} />
          </TabsContent>

          <TabsContent value="team" className="h-full m-0">
            <TeamListPanel
              workspaceId={workspaceId}
              teams={teams ?? []}
              overview={overview}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default UserManagementPanel;
