/**
 * Platform Admin System
 * 
 * Provides platform-level super admin functionality.
 * Platform admins have full access to ALL workspaces and features.
 * 
 * Hierarchy:
 * 1. Platform Admin - Full access to everything (highest priority)
 * 2. Feature Owner - Admin for features they created via Builder
 * 3. Workspace Owner - Admin for their workspace
 * 4. Role-based - Based on workspace membership
 * 
 * @example
 * ```ts
 * import { isPlatformAdmin, requirePlatformAdmin } from "../lib/platformAdmin";
 * 
 * // Check if user is platform admin
 * if (isPlatformAdmin(user.email)) {
 *   // Grant full access
 * }
 * 
 * // In a mutation/query
 * const ctx = await requirePlatformAdmin(ctx);
 * ```
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Get platform admin emails from environment variable
 * Set in Convex Dashboard: PLATFORM_ADMIN_EMAILS=admin@example.com,admin2@example.com
 */
export function getPlatformAdminEmails(): string[] {
  const envEmails = process.env.PLATFORM_ADMIN_EMAILS ?? "";

  return envEmails
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AccessLevel =
  | "platform_admin"   // Full access to everything
  | "feature_owner"    // Admin for features they created
  | "workspace_owner"  // Owner of the workspace
  | "workspace_admin"  // Admin role in workspace
  | "workspace_member" // Regular member
  | "guest"            // Read-only access
  | "none";            // No access

export interface PlatformAdminContext {
  isPlatformAdmin: true;
  email: string;
  authSubject: string;
  name: string;
  roleLevel: 0;
  permissions: ["*"];
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Check if an email belongs to a platform admin
 * 
 * @param email - The email to check
 * @returns true if the email is a platform admin
 */
export function isPlatformAdmin(email: string | undefined | null): boolean {
  if (!email) return false;

  const adminEmails = getPlatformAdminEmails();
  const normalizedEmail = email.toLowerCase().trim();

  return adminEmails.includes(normalizedEmail);
}

/**
 * Get the access level for a user based on various factors
 * 
 * @param userEmail - The user's email
 * @param options - Additional context (feature ownership, workspace ownership, etc.)
 * @returns The user's access level
 */
export function getAccessLevel(
  userEmail: string | undefined | null,
  options: {
    isFeatureOwner?: boolean;
    isWorkspaceOwner?: boolean;
    roleLevel?: number;
  } = {}
): AccessLevel {
  // Platform admin trumps all
  if (isPlatformAdmin(userEmail)) {
    return "platform_admin";
  }

  // Feature owner for custom features created via Builder
  if (options.isFeatureOwner) {
    return "feature_owner";
  }

  // Workspace hierarchy
  if (options.isWorkspaceOwner) {
    return "workspace_owner";
  }

  // Role-based access within workspace
  if (options.roleLevel !== undefined) {
    if (options.roleLevel <= 10) return "workspace_admin";
    if (options.roleLevel <= 70) return "workspace_member";
    return "guest";
  }

  return "none";
}

/**
 * Check if an access level has at least the required level
 * 
 * @param current - The user's current access level
 * @param required - The minimum required access level
 * @returns true if the user has sufficient access
 */
export function hasAccessLevel(current: AccessLevel, required: AccessLevel): boolean {
  const hierarchy: AccessLevel[] = [
    "platform_admin",
    "feature_owner",
    "workspace_owner",
    "workspace_admin",
    "workspace_member",
    "guest",
    "none",
  ];

  const currentIndex = hierarchy.indexOf(current);
  const requiredIndex = hierarchy.indexOf(required);

  // Lower index = higher access
  return currentIndex <= requiredIndex;
}

/**
 * Create a platform admin context object
 * Used when bypassing normal permission checks
 */
export function createPlatformAdminContext(
  email: string,
  authSubject: string,
  name: string = "Platform Admin"
): PlatformAdminContext {
  return {
    isPlatformAdmin: true,
    email,
    authSubject,
    name,
    roleLevel: 0,
    permissions: ["*"],
  };
}

// ============================================================================
// PERMISSION HELPERS
// ============================================================================

/**
 * Check if a permission string matches the platform admin wildcard
 */
export function matchesPlatformAdminPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  // Platform admin has ["*"] which matches everything
  if (userPermissions.includes("*")) {
    return true;
  }

  return userPermissions.includes(requiredPermission);
}

/**
 * Get all admin emails for logging/debugging purposes
 * Only call this in development or for audit logs
 */
export function getAdminEmailsForDebug(): string[] {
  const emails = getPlatformAdminEmails();
  // Mask emails for security (show first 3 chars + domain)
  return emails.map(email => {
    const [local, domain] = email.split("@");
    if (!domain) return "***";
    const masked = local.substring(0, 3) + "***";
    return `${masked}@${domain}`;
  });
}
