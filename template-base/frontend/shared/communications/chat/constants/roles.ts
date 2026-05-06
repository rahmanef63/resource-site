/**
 * Role and permission constants
 * @module shared/chat/constants/roles
 */

import type { ChatPermission, ChatRole } from "../types/config";

/**
 * Default permission matrix by role
 */
export const DEFAULT_PERMISSIONS: Record<ChatRole, ChatPermission[]> = {
  owner: [
    "send",
    "edit",
    "delete",
    "pin",
    "manageUsers",
    "rename",
    "changeAvatar",
  ],
  admin: ["send", "edit", "delete", "pin", "manageUsers"],
  member: ["send", "edit", "delete"],
  guest: ["send"],
};

/**
 * Role hierarchy (higher index = more powerful)
 */
export const ROLE_HIERARCHY: ChatRole[] = ["guest", "member", "admin", "owner"];

/**
 * Check if roleA has higher or equal privileges than roleB
 */
export function isRoleHigherOrEqual(roleA: ChatRole, roleB: ChatRole): boolean {
  return ROLE_HIERARCHY.indexOf(roleA) >= ROLE_HIERARCHY.indexOf(roleB);
}

/**
 * Get role display name
 */
export const ROLE_DISPLAY_NAMES: Record<ChatRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  guest: "Guest",
};

/**
 * Permission display names
 */
export const PERMISSION_DISPLAY_NAMES: Record<ChatPermission, string> = {
  send: "Send messages",
  edit: "Edit messages",
  delete: "Delete messages",
  pin: "Pin messages",
  manageUsers: "Manage participants",
  rename: "Rename chat",
  changeAvatar: "Change chat avatar",
};

/**
 * Context-specific default roles
 */
export const CONTEXT_DEFAULT_ROLES = {
  comment: "member" as ChatRole,
  support: "guest" as ChatRole,
  workspace: "member" as ChatRole,
  project: "member" as ChatRole,
  document: "member" as ChatRole,
  crm: "member" as ChatRole,
  system: "guest" as ChatRole,
} as const;
