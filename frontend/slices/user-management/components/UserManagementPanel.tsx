"use client";

// UserManagementPanel — the composed surface: Members + Roles (+ optional
// Teams) tabs. Pass the per-tab prop bags. (Invites live inside the
// Members tab.) The Teams tab only renders when `teams` is provided.

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MembersPanel, type MembersPanelProps } from "./MembersPanel";
import { RolesPanel, type RolesPanelProps } from "./RolesPanel";
import { TeamsPanel, type TeamsPanelProps } from "./TeamsPanel";

export interface UserManagementPanelProps {
  members: MembersPanelProps;
  roles: RolesPanelProps;
  teams?: TeamsPanelProps;
  defaultTab?: "members" | "roles" | "teams";
  membersLabel?: string;
  rolesLabel?: string;
  teamsLabel?: string;
  className?: string;
}

export function UserManagementPanel({
  members, roles, teams, defaultTab = "members",
  membersLabel = "Members", rolesLabel = "Roles", teamsLabel = "Teams", className,
}: UserManagementPanelProps) {
  return (
    <Tabs defaultValue={defaultTab} className={className}>
      <TabsList>
        <TabsTrigger value="members">{membersLabel}</TabsTrigger>
        <TabsTrigger value="roles">{rolesLabel}</TabsTrigger>
        {teams ? <TabsTrigger value="teams">{teamsLabel}</TabsTrigger> : null}
      </TabsList>
      <TabsContent value="members" className="mt-4">
        <MembersPanel {...members} />
      </TabsContent>
      <TabsContent value="roles" className="mt-4">
        <RolesPanel {...roles} />
      </TabsContent>
      {teams ? (
        <TabsContent value="teams" className="mt-4">
          <TeamsPanel {...teams} />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
