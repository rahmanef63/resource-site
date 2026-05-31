// Grouped, human-labelled view of the core permission catalog — drives
// the default <PermissionMatrix>. Consumers pass their own groups to add
// app-specific permissions.

import type { Permission } from "./permissions";

export interface PermissionDef {
  key: Permission;
  label: string;
}
export interface PermissionGroup {
  group: string;
  permissions: PermissionDef[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    group: "Workspace",
    permissions: [
      { key: "workspace.view", label: "View workspace" },
      { key: "workspace.manage", label: "Manage workspace" },
      { key: "workspace.delete", label: "Delete workspace" },
      { key: "settings.manage", label: "Manage settings" },
      { key: "audit.view", label: "View audit log" },
    ],
  },
  {
    group: "Members & roles",
    permissions: [
      { key: "members.view", label: "View members" },
      { key: "members.manage", label: "Manage members" },
      { key: "members.invite", label: "Invite members" },
      { key: "roles.view", label: "View roles" },
      { key: "roles.manage", label: "Manage roles" },
      { key: "invitations.manage", label: "Manage invitations" },
    ],
  },
  {
    group: "Content & documents",
    permissions: [
      { key: "content.view", label: "View content" },
      { key: "content.create", label: "Create content" },
      { key: "content.edit", label: "Edit content" },
      { key: "content.delete", label: "Delete content" },
      { key: "content.publish", label: "Publish content" },
      { key: "documents.view", label: "View documents" },
      { key: "documents.create", label: "Create documents" },
      { key: "documents.edit", label: "Edit documents" },
      { key: "documents.delete", label: "Delete documents" },
    ],
  },
  {
    group: "Other",
    permissions: [
      { key: "comments.view", label: "View comments" },
      { key: "comments.manage", label: "Manage comments" },
      { key: "billing.view", label: "View billing" },
      { key: "billing.manage", label: "Manage billing" },
      { key: "analytics.view", label: "View analytics" },
    ],
  },
];
