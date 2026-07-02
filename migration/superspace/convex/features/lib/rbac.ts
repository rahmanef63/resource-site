import type { Doc } from "../../_generated/dataModel";
import {
  getMembership,
  hasPermission as membershipHasPermission,
  requirePermission as requireWorkspacePermission,
  type MembershipInfo,
  type AnyConvexCtx,
} from "../../shared/auth";
import {
  isPlatformAdmin,
  createPlatformAdminContext,
  type PlatformAdminContext,
} from "../../lib/platformAdmin";
import { readIdentityEmail, readIdentityName, resolveAuthEmail } from "../../lib/authIdentity";

type AdminUserDoc = Doc<"adminUsers">;

export type ActorContext = {
  adminUserId: AdminUserDoc["_id"];
  clerkUserId: string;
  email: string;
  name: string;
  roleLevel: number;
  permissions: string[];
};

const ACTIVE_STATUS = "active";

const SYSTEM_ADMIN_PERMISSION = "system.admin";
const EDITOR_PERMISSIONS = [
  "content.create",
  "content.edit",
  "content.publish",
  "content.manage",
];

async function getActiveAdminUser(ctx: AnyConvexCtx): Promise<AdminUserDoc> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }

  const email = (await resolveAuthEmail(ctx)) ?? "";
  const name = readIdentityName(identity) ?? "Platform Admin";

  // ========================================
  // PLATFORM ADMIN CHECK (HIGHEST PRIORITY)
  // ========================================
  if (isPlatformAdmin(email)) {
    
    // Return a virtual admin user with full permissions
    return {
      _id: "platform_admin" as any,
      _creationTime: Date.now(),
      clerkId: identity.subject,
      email,
      name,
      roleLevel: 0, // Highest level
      permissions: ["*"], // All permissions (wildcard)
      status: "active",
      workspaceIds: [], // Has access to ALL workspaces
      isPlatformAdmin: true,
      createdBy: null,
      updatedBy: null,
    } as AdminUserDoc;
  }

  // ========================================
  // NORMAL ADMIN USER LOOKUP
  // ========================================
  // Convex Auth: identity.subject = Convex user._id, not the legacy Clerk
  // subject the adminUsers / users rows were keyed by. Try by_clerk_id
  // (legacy session) first, then fall back to email (canonical, same on
  // both providers).
  let adminUser = await ctx.db
    .query("adminUsers")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!adminUser && email) {
    adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  }

  // Auto-create admin user if user is a workspace owner
  if (!adminUser) {

    // Get the user from users table — same fallback chain.
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user && email) {
      user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .first();
    }
    
    if (!user) {
      throw new Error("User record not found. Please ensure you are logged in.");
    }
    const resolvedUser = user;

    // Check if user is owner of any workspace (role level 0)
    const ownerMembership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user", (q) => q.eq("userId", resolvedUser._id))
      .filter((q) => q.eq(q.field("roleLevel"), 0))
      .first();
    
    if (!ownerMembership) {
      throw new Error("CMS access requires workspace owner role. Please contact your administrator.");
    }
    
    // User is a workspace owner - return a temporary admin user object
    // The actual admin user record will be created by initializeSelfAsAdmin action
    const ownerEmail = readIdentityEmail(identity) ?? resolvedUser.email ?? "no-email@example.com";
    const ownerName = readIdentityName(identity) ?? resolvedUser.name ?? "User";

    // Return a temporary admin user object that matches workspace owner permissions
    return {
      _id: resolvedUser._id as any, // Use user ID temporarily
      _creationTime: Date.now(),
      clerkId: identity.subject,
      email: ownerEmail,
      name: ownerName,
      roleLevel: 0, // Owner level
      permissions: ["*"], // All permissions
      status: "active",
      workspaceIds: [ownerMembership.workspaceId],
      createdBy: identity.subject,
      updatedBy: identity.subject,
    } as AdminUserDoc;
  }

  if (adminUser.status !== ACTIVE_STATUS) {
    throw new Error("Account is not active");
  }

  return adminUser;
}

function toActor(user: AdminUserDoc): ActorContext {
  return {
    adminUserId: user._id,
    clerkUserId: user.clerkId,
    email: user.email,
    name: user.name,
    roleLevel: user.roleLevel,
    permissions: user.permissions,
  };
}

function hasAnyPermission(user: AdminUserDoc, permissions: string[]): boolean {
  // Platform admin wildcard matches everything
  if (user.permissions.includes("*")) {
    return true;
  }
  return permissions.some((perm) => user.permissions.includes(perm));
}

function isSystemAdmin(user: AdminUserDoc): boolean {
  // Platform admin with wildcard permission is always system admin
  if (user.permissions.includes("*")) {
    return true;
  }
  return (
    user.roleLevel <= 10 ||
    user.permissions.includes(SYSTEM_ADMIN_PERMISSION)
  );
}

async function ensureRoleLevel(
  ctx: AnyConvexCtx,
  allowedLevel: number,
  options: {
    fallbackPermissions?: string[];
    errorMessage: string;
  },
): Promise<ActorContext> {
  const adminUser = await getActiveAdminUser(ctx);
  const hasRoleAccess = adminUser.roleLevel <= allowedLevel;
  const hasFallback =
    options.fallbackPermissions &&
    hasAnyPermission(adminUser, options.fallbackPermissions);

  if (isSystemAdmin(adminUser) || hasRoleAccess || hasFallback) {
    return toActor(adminUser);
  }

  throw new Error(options.errorMessage);
}

export async function requireOwner(ctx: AnyConvexCtx): Promise<ActorContext> {
  return ensureRoleLevel(ctx, 0, {
    errorMessage: "Owner access required",
  });
}

export async function requireAdmin(ctx: AnyConvexCtx): Promise<ActorContext> {
  return ensureRoleLevel(ctx, 10, {
    errorMessage: "Admin access required",
  });
}

/**
 * Workspace-scoped admin gate. Combines role gate (level ≤ 10) with workspace
 * membership cross-check so a global admin can't mutate docs in a workspace they
 * don't belong to. Platform admins bypass workspace check (intentional).
 */
export async function requireAdminForWorkspace(
  ctx: AnyConvexCtx,
  workspaceId: string,
): Promise<ActorContext> {
  const actor = await requireAdmin(ctx);
  if (actor.permissions.includes("*")) {
    return actor;
  }
  await ensureWorkspaceMembership(ctx, workspaceId);
  return actor;
}

/**
 * Assert that a document belongs to the expected workspace. Use after fetching
 * a doc by ID to prevent cross-tenant write/delete.
 */
export function assertDocWorkspace(
  doc: { workspaceId?: string } | null | undefined,
  workspaceId: string,
  resourceType = "resource",
): void {
  if (!doc) {
    throw new Error(`${resourceType} not found`);
  }
  // Legacy data without workspaceId: allow (will be backfilled). New writes
  // always set workspaceId so going forward this branch becomes dead code.
  // TODO: remove this branch once the cmsLite backfill (migrateWorkspaceId) has
  // run in every environment and schema fields can flip to required.
  if (doc.workspaceId === undefined) {
    return;
  }
  if (doc.workspaceId !== workspaceId) {
    throw new Error(`${resourceType} does not belong to this workspace`);
  }
}

export async function requireEditor(ctx: AnyConvexCtx): Promise<ActorContext> {
  return ensureRoleLevel(ctx, 50, {
    fallbackPermissions: EDITOR_PERMISSIONS,
    errorMessage: "Editor access required",
  });
}

export async function ensureWorkspaceMembership(
  ctx: AnyConvexCtx,
  workspaceId: string,
): Promise<MembershipInfo> {
  const membership = await getMembership(ctx, workspaceId);
  if (!membership) {
    throw new Error("Not a member of this workspace");
  }
  return membership;
}

// Thin adapter over the unified convex/shared/auth.ts `requirePermission`
// (imported as `requireWorkspacePermission`). It only re-shapes the result to
// `{ membership }`; it carries NO permission logic of its own, so the SSOT
// decision in convex/lib/rbac/policy.ts is the only authority here (QA finding
// C4). Do NOT add a divergent permission check in this wrapper.
export async function requirePermission(
  ctx: AnyConvexCtx,
  workspaceId: string,
  permission: string,
): Promise<{ membership: MembershipInfo }> {
  const membership = await requireWorkspacePermission(
    ctx,
    workspaceId,
    permission,
  );
  return { membership };
}

export async function hasPermission(
  ctx: AnyConvexCtx,
  workspaceId: string,
  permission: string,
): Promise<boolean> {
  // Check platform admin first
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    const email = (await resolveAuthEmail(ctx)) ?? "";
    if (isPlatformAdmin(email)) {
      return true; // Platform admin has all permissions
    }
  }
  
  return membershipHasPermission(ctx, workspaceId, permission);
}

// ============================================================================
// PLATFORM ADMIN SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Require platform admin access (throws if not platform admin)
 */
export async function requirePlatformAdmin(ctx: AnyConvexCtx): Promise<ActorContext> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  
  const email = (await resolveAuthEmail(ctx)) ?? "";
  
  if (!isPlatformAdmin(email)) {
    throw new Error("Platform administrator access required");
  }
  
  return {
    adminUserId: "platform_admin" as any,
    clerkUserId: identity.subject,
    email,
    name: (identity.name ?? "Platform Admin") as string,
    roleLevel: 0,
    permissions: ["*"],
  };
}

/**
 * Check if current user is platform admin (non-throwing)
 */
export async function checkPlatformAdmin(ctx: AnyConvexCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  
  const email = (await resolveAuthEmail(ctx)) ?? "";
  return isPlatformAdmin(email);
}

/**
 * Get actor context with platform admin check
 * Returns platform admin context if user is platform admin,
 * otherwise returns normal actor context
 */
export async function getActorWithPlatformCheck(ctx: AnyConvexCtx): Promise<ActorContext> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  
  const email = (await resolveAuthEmail(ctx)) ?? "";
  
  // Platform admin gets special context
  if (isPlatformAdmin(email)) {
    return {
      adminUserId: "platform_admin" as any,
      clerkUserId: identity.subject,
      email,
      name: readIdentityName(identity) ?? "Platform Admin",
      roleLevel: 0,
      permissions: ["*"],
    };
  }
  
  // Otherwise use normal admin user lookup
  const adminUser = await getActiveAdminUser(ctx);
  return toActor(adminUser);
}
