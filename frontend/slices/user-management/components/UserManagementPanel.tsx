"use client";

// UserManagementPanel — the composed surface: Members + Roles tabs. Pass
// the per-tab prop bags. (Invites live inside the Members tab.)

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MembersPanel, type MembersPanelProps } from "./MembersPanel";
import { RolesPanel, type RolesPanelProps } from "./RolesPanel";

export interface UserManagementPanelProps {
  members: MembersPanelProps;
  roles: RolesPanelProps;
  defaultTab?: "members" | "roles";
  membersLabel?: string;
  rolesLabel?: string;
  className?: string;
}

export function UserManagementPanel({
  members, roles, defaultTab = "members", membersLabel = "Members", rolesLabel = "Roles", className,
}: UserManagementPanelProps) {
  return (
    <Tabs defaultValue={defaultTab} className={className}>
      <TabsList>
        <TabsTrigger value="members">{membersLabel}</TabsTrigger>
        <TabsTrigger value="roles">{rolesLabel}</TabsTrigger>
      </TabsList>
      <TabsContent value="members" className="mt-4">
        <MembersPanel {...members} />
      </TabsContent>
      <TabsContent value="roles" className="mt-4">
        <RolesPanel {...roles} />
      </TabsContent>
    </Tabs>
  );
}
