/**
 * Permission guard utilities for RBAC
 * @module shared/chat/util/guard
 */

import type { ChatConfig, ChatPermission, ChatRole } from "../types/config";
import type { Message, UserMeta } from "../types/message";
import { DEFAULT_PERMISSIONS, isRoleHigherOrEqual } from "../constants/roles";

/**
 * Get user's role in a room
 */
export function getUserRole(
  userId: string,
  roomRoles?: Record<string, ChatRole>
): ChatRole {
  return roomRoles?.[userId] || "guest";
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(
  role: ChatRole,
  config?: ChatConfig
): ChatPermission[] {
  const permissions = config?.permissions || DEFAULT_PERMISSIONS;
  return permissions[role] || [];
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userId: string,
  permission: ChatPermission,
  roomRoles?: Record<string, ChatRole>,
  config?: ChatConfig
): boolean {
  const role = getUserRole(userId, roomRoles);
  const permissions = getRolePermissions(role, config);
  return permissions.includes(permission);
}

/**
 * Check if user can send messages
 */
export function canSend(
  userId: string,
  roomRoles?: Record<string, ChatRole>,
  config?: ChatConfig
): boolean {
  return hasPermission(userId, "send", roomRoles, config);
}

/**
 * Check if user can edit a message
 */
export function canEdit(
  userId: string,
  message: Message,
  roomRoles?: Record<string, ChatRole>,
  config?: ChatConfig
): boolean {
  const editMode = config?.messageEditing || "author";

  if (editMode === "off") return false;

  if (editMode === "author") {
    return message.author.id === userId;
  }

  if (editMode === "admin") {
    const role = getUserRole(userId, roomRoles);
    return (
      message.author.id === userId ||
      isRoleHigherOrEqual(role, "admin")
    );
  }

  return false;
}

/**
 * Check if user can delete a message
 */
export function canDelete(
  userId: string,
  message: Message,
  roomRoles?: Record<string, ChatRole>,
  config?: ChatConfig
): boolean {
  const deleteMode = config?.messageDeletion || "author";

  if (deleteMode === "off") return false;

  if (deleteMode === "author") {
    return message.author.id === userId;
  }

  if (deleteMode === "admin") {
    const role = getUserRole(userId, roomRoles);
    return (
      message.author.id === userId ||
      isRoleHigherOrEqual(role, "admin")
    );
  }

  if (deleteMode === "hard") {
    const role = getUserRole(userId, roomRoles);
    return isRoleHigherOrEqual(role, "admin");
  }

  return false;
}

/**
 * Check if user can pin messages
 */
export function canPin(
  userId: string,
  roomRoles?: Record<string, ChatRole>,
  config?: ChatConfig
): boolean {
  if (!config?.pinMessageEnabled) return false;
  return hasPermission(userId, "pin", roomRoles, config);
}

/**
 * Check if user can manage participants
 */
export function canManageUsers(
  userId: string,
  roomRoles?: Record<string, ChatRole>,
  config?: ChatConfig
): boolean {
  return hasPermission(userId, "manageUsers", roomRoles, config);
}

/**
 * Check if user can rename the room
 */
export function canRename(
  userId: string,
  roomRoles?: Record<string, ChatRole>,
  config?: ChatConfig
): boolean {
  return hasPermission(userId, "rename", roomRoles, config);
}

/**
 * Check if user can change room avatar
 */
export function canChangeAvatar(
  userId: string,
  roomRoles?: Record<string, ChatRole>,
  config?: ChatConfig
): boolean {
  return hasPermission(userId, "changeAvatar", roomRoles, config);
}

/**
 * Check if user can perform an action on another user
 */
export function canManageUser(
  actorId: string,
  targetId: string,
  roomRoles?: Record<string, ChatRole>
): boolean {
  const actorRole = getUserRole(actorId, roomRoles);
  const targetRole = getUserRole(targetId, roomRoles);

  // Can't manage yourself
  if (actorId === targetId) return false;

  // Must have higher role than target
  return isRoleHigherOrEqual(actorRole, "admin") &&
         !isRoleHigherOrEqual(targetRole, actorRole);
}

/**
 * Validate message length
 */
export function validateMessageLength(
  text: string,
  config?: ChatConfig
): { valid: boolean; error?: string } {
  const maxLength = config?.maxMessageLength || 10000;

  if (text.length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (text.length > maxLength) {
    return {
      valid: false,
      error: `Message exceeds maximum length of ${maxLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate attachment size
 */
export function validateAttachmentSize(
  sizeBytes: number,
  config?: ChatConfig
): { valid: boolean; error?: string } {
  if (!config?.allowAttachments) {
    return { valid: false, error: "Attachments are not allowed" };
  }

  const maxSizeMB = config.maxAttachmentSizeMB || 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (sizeBytes > maxSizeBytes) {
    return {
      valid: false,
      error: `File exceeds maximum size of ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(
  feature: keyof ChatConfig,
  config?: ChatConfig
): boolean {
  return config?.[feature] === true;
}
