"use client";

// UserManagementPanel — the composed surface: Members + Roles (+ optional
// Teams) tabs. Pass the per-tab prop bags. (Invites live inside the
// Members tab.) The Teams tab only renders when `teams` is provided.

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MembersPanel, type MembersPanelProps } from "./MembersPanel";
import { RolesPanel, type RolesPanelProps } from "./RolesPanel";
import { TeamsPanel, type TeamsPanelProps } from "./TeamsPanel";
import { AccessMatrix, type AccessMatrixProps } from "./AccessMatrix";

export interface UserManagementPanelProps {
  members: MembersPanelProps;
  roles: RolesPanelProps;
  teams?: TeamsPanelProps;
  access?: AccessMatrixProps;
  defaultTab?: "members" | "roles" | "teams" | "access";
  membersLabel?: string;
  rolesLabel?: string;
  teamsLabel?: string;
  accessLabel?: string;
  className?: string;
}

export function UserManagementPanel({
  members, roles, teams, access, defaultTab = "members",
  membersLabel = "Members", rolesLabel = "Roles", teamsLabel = "Teams", accessLabel = "Access", className,
}: UserManagementPanelProps) {
  return (
    <Tabs defaultValue={defaultTab} className={className}>
      <TabsList>
        <TabsTrigger value="members">{membersLabel}</TabsTrigger>
        <TabsTrigger value="roles">{rolesLabel}</TabsTrigger>
        {teams ? <TabsTrigger value="teams">{teamsLabel}</TabsTrigger> : null}
        {access ? <TabsTrigger value="access">{accessLabel}</TabsTrigger> : null}
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
      {access ? (
        <TabsContent value="access" className="mt-4">
          <AccessMatrix {...access} />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
