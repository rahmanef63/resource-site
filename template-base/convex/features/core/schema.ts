import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userPrivacySettings = defineTable({
  userId: v.id("users"),
  isVisible: v.boolean(),
  allowDirectMessages: v.boolean(),
  allowcontactsRequests: v.boolean(),
  visibilityMode: v.union(
    v.literal("everyone"),
    v.literal("workspaces_only"),
    v.literal("custom"),
  ),
  hiddenFromUsers: v.array(v.id("users")),
  hiddenFromWorkspaces: v.array(v.id("workspaces")),
  visibleToUsers: v.array(v.id("users")),
  visibleToWorkspaces: v.array(v.id("workspaces")),
}).index("by_user", ["userId"]);

export const organizations = defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  logo: v.optional(v.string()),
  website: v.optional(v.string()),
  isPublic: v.boolean(),
  settings: v.optional(
    v.object({
      allowPublicWorkspaces: v.boolean(),
      requireApproval: v.boolean(),
      defaultRole: v.string(),
    }),
  ),
  createdBy: v.id("users"),
})
  .index("by_slug", ["slug"])
  .index("by_creator", ["createdBy"]);

export const organizationMemberships = defineTable({
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  status: v.union(
    v.literal("active"),
    v.literal("inactive"),
    v.literal("pending"),
  ),
  joinedAt: v.number(),
  invitedBy: v.optional(v.id("users")),
})
  .index("by_organization", ["organizationId"])
  .index("by_user", ["userId"])
  .index("by_user_organization", ["userId", "organizationId"]);

export const workspaces = defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  type: v.union(
    v.literal("organization"),
    v.literal("institution"),
    v.literal("group"),
    v.literal("family"),
    v.literal("personal"),
  ),
  organizationId: v.optional(v.id("organizations")),
  logo: v.optional(v.string()),
  // Icon name (from lucide-react icon set)
  icon: v.optional(v.string()),
  // Uploaded image logo (stored in Convex storage)
  logoStorageId: v.optional(v.id("_storage")),
  // Theme preset name from registry (e.g., "default", "blue", "zinc")
  themePreset: v.optional(v.string()),
  isPublic: v.boolean(),

  // === Nested Workspace Hierarchy Fields ===
  // Parent workspace for hierarchy (null = root level)
  parentWorkspaceId: v.optional(v.id("workspaces")),
  // True if this is the user's main/hub workspace (one per user)
  isMainWorkspace: v.optional(v.boolean()),
  // Display color for sidebar menu differentiation (hex color)
  color: v.optional(v.string()),
  // Hierarchy depth (0 = root/main, 1 = first child, etc.)
  depth: v.optional(v.number()),
  // Materialized path for efficient ancestor/descendant queries
  path: v.optional(v.array(v.id("workspaces"))),
  // Whether this workspace shares data (knowledge, activity) to parent workspace
  shareDataToParent: v.optional(v.boolean()),

  // === Localization ===
  // Workspace timezone (IANA format, e.g., "America/New_York", "Asia/Jakarta")
  timezone: v.optional(v.string()),
  // Workspace language/locale (ISO 639-1, e.g., "en", "id", "es")
  language: v.optional(v.string()),

  // === Archive & Soft Delete ===
  // Whether workspace is archived (hidden from active list but data preserved)
  isArchived: v.optional(v.boolean()),
  archivedAt: v.optional(v.number()),
  archivedBy: v.optional(v.id("users")),
  // Soft delete fields (for recovery mode)
  isDeleted: v.optional(v.boolean()),
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.id("users")),
  // Recovery expiration (after this, permanent delete is allowed)
  recoveryExpiresAt: v.optional(v.number()),

  // === Template Reference ===
  // If created from a template, reference to the source template
  sourceTemplateId: v.optional(v.id("workspaceTemplates")),
  // If this workspace was cloned, reference to the source workspace
  clonedFromId: v.optional(v.id("workspaces")),

  // === Registry Metadata ===
  // Additive workspace-launch metadata for desktop/mobile surfaces.
  registry: v.optional(
    v.object({
      mobileLabel: v.optional(v.string()),
      desktopLabel: v.optional(v.string()),
      workspaceCategory: v.optional(
        v.union(
          v.literal("core"),
          v.literal("business-app"),
          v.literal("tool"),
          v.literal("external-link"),
        ),
      ),
      launchType: v.optional(
        v.union(
          v.literal("internal"),
          v.literal("external"),
          v.literal("rendered"),
          v.literal("hybrid"),
        ),
      ),
      launchUrl: v.optional(v.string()),
      mobileRoute: v.optional(v.string()),
      sourceManifestUrl: v.optional(v.string()),
      blockManifestUrl: v.optional(v.string()),
      healthUrl: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
      badge: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      status: v.optional(
        v.union(
          v.literal("active"),
          v.literal("beta"),
          v.literal("hidden"),
          v.literal("draft"),
        ),
      ),
      isLauncherVisible: v.optional(v.boolean()),
    }),
  ),

  settings: v.optional(
    v.object({
      allowInvites: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      defaultRoleId: v.optional(v.id("roles")),
      allowPublicDocuments: v.optional(v.boolean()),
      theme: v.optional(v.string()),
      // Bundle configuration
      bundleId: v.optional(v.string()),
      enabledFeatures: v.optional(v.array(v.string())),
      // Main workspace specific: restrict invitations
      allowGuestOnly: v.optional(v.boolean()),
      // Guest access duration in milliseconds (for time-limited access)
      guestAccessDuration: v.optional(v.number()),
    }),
  ),
  createdBy: v.id("users"),
})
  .index("by_slug", ["slug"])
  .index("by_organization", ["organizationId"])
  .index("by_creator", ["createdBy"])
  .index("by_type", ["type"])
  // New indexes for hierarchy
  .index("by_parent", ["parentWorkspaceId"])
  .index("by_main", ["isMainWorkspace"])
  .index("by_creator_main", ["createdBy", "isMainWorkspace"])
  .index("by_depth", ["depth"])
  // Archive & soft-delete indexes
  .index("by_archived", ["isArchived"])
  .index("by_deleted", ["isDeleted"])
  .index("by_template", ["sourceTemplateId"])
  .index("by_cloned_from", ["clonedFromId"]);

export const roles = defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  workspaceId: v.id("workspaces"),
  permissions: v.array(v.string()),
  color: v.optional(v.string()),
  isDefault: v.boolean(),
  isSystemRole: v.optional(v.boolean()),
  level: v.optional(v.number()),
  icon: v.optional(v.string()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_slug", ["workspaceId", "slug"])
  .index("by_level", ["workspaceId", "level"]);

export const workspaceMemberships = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.id("users"),
  roleId: v.id("roles"),
  themePreset: v.optional(v.string()),
  status: v.union(
    v.literal("active"),
    v.literal("inactive"),
    v.literal("pending"),
  ),
  roleLevel: v.optional(v.number()),
  additionalPermissions: v.array(v.string()),
  joinedAt: v.number(),
  invitedBy: v.optional(v.id("users")),
  lastActiveAt: v.optional(v.number()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_user", ["userId"])
  .index("by_user_workspace", ["userId", "workspaceId"])
  .index("by_role", ["roleId"]);

export const invitations = defineTable({
  type: v.union(v.literal("workspace"), v.literal("personal")),
  workspaceId: v.optional(v.id("workspaces")),
  inviterId: v.id("users"),
  inviteeEmail: v.string(),
  inviteeId: v.optional(v.id("users")),
  roleId: v.optional(v.id("roles")),
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("declined"),
    v.literal("expired"),
  ),
  message: v.optional(v.string()),
  expiresAt: v.number(),
  acceptedAt: v.optional(v.number()),
  token: v.string(),
})
  .index("by_inviter", ["inviterId"])
  .index("by_invitee_email", ["inviteeEmail"])
  .index("by_invitee_id", ["inviteeId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_token", ["token"])
  .index("by_status", ["status"]);

/**
 * Workspace Links - Junction table for linking workspaces as children
 * This allows a workspace to appear in multiple users' hierarchies
 * without duplicating the workspace itself.
 * 
 * Example: Company A workspace can be linked as a child of:
 * - User 1's "Works" workspace
 * - User 2's "Freelance" workspace
 */
export const workspaceLinks = defineTable({
  // The parent workspace that contains the link
  parentWorkspaceId: v.id("workspaces"),
  // The child workspace being linked
  childWorkspaceId: v.id("workspaces"),
  // User who created this link
  linkedBy: v.id("users"),
  // Display order within parent
  sortOrder: v.optional(v.number()),
  // Optional custom display name for this link
  displayName: v.optional(v.string()),
  // Optional custom color override for this link
  colorOverride: v.optional(v.string()),
  // When the link was created
  linkedAt: v.number(),
})
  .index("by_parent", ["parentWorkspaceId"])
  .index("by_child", ["childWorkspaceId"])
  .index("by_parent_child", ["parentWorkspaceId", "childWorkspaceId"])
  .index("by_linked_by", ["linkedBy"]);

/**
 * Workspace Templates - Reusable workspace configurations
 * Templates can be system-provided or user-created.
 * Used for quick workspace creation with pre-configured settings, roles, and features.
 */
export const workspaceTemplates = defineTable({
  // Template metadata
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  // Icon name (from lucide-react icon set)
  icon: v.optional(v.string()),
  // Cover image for template card
  coverImageUrl: v.optional(v.string()),

  // Template type
  category: v.union(
    v.literal("business"),
    v.literal("personal"),
    v.literal("team"),
    v.literal("project"),
    v.literal("industry"),
    v.literal("custom"),
  ),
  // Industry tags for filtering (e.g., "consulting", "saas", "agency")
  industryTags: v.optional(v.array(v.string())),

  // === Workspace Configuration ===
  // Default workspace type when created from this template
  workspaceType: v.union(
    v.literal("organization"),
    v.literal("institution"),
    v.literal("group"),
    v.literal("family"),
    v.literal("personal"),
  ),
  // Default settings to apply
  defaultSettings: v.optional(
    v.object({
      allowInvites: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      allowPublicDocuments: v.optional(v.boolean()),
      theme: v.optional(v.string()),
      bundleId: v.optional(v.string()),
      enabledFeatures: v.optional(v.array(v.string())),
      allowGuestOnly: v.optional(v.boolean()),
      guestAccessDuration: v.optional(v.number()),
    }),
  ),
  // Default timezone for workspaces created from this template
  defaultTimezone: v.optional(v.string()),
  // Default language for workspaces created from this template
  defaultLanguage: v.optional(v.string()),

  // === Features & Roles ===
  // List of feature slugs to enable by default
  enabledFeatures: v.array(v.string()),
  // Custom roles to create (beyond system roles)
  customRoles: v.optional(
    v.array(
      v.object({
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        permissions: v.array(v.string()),
        color: v.optional(v.string()),
        level: v.number(),
      }),
    ),
  ),

  // === Access Control ===
  // System templates are managed by platform, cannot be edited by users
  isSystemTemplate: v.boolean(),
  // Public templates are visible to all users
  isPublic: v.boolean(),
  // If not public, which workspaces can use this template
  allowedWorkspaceIds: v.optional(v.array(v.id("workspaces"))),

  // === Metadata ===
  createdBy: v.id("users"),
  updatedBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  // Usage count for popularity sorting
  usageCount: v.optional(v.number()),
})
  .index("by_slug", ["slug"])
  .index("by_category", ["category"])
  .index("by_creator", ["createdBy"])
  .index("by_public", ["isPublic"])
  .index("by_system", ["isSystemTemplate"]);

export const coreTables = {
  userPrivacySettings,
  organizations,
  organizationMemberships,
  workspaces,
  workspaceLinks,
  workspaceTemplates,
  roles,
  workspaceMemberships,
  invitations,
};
