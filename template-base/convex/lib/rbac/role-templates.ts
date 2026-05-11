import { PERMS } from "./perms";

type WorkspacePermission = (typeof PERMS)[keyof typeof PERMS] | "*";

export type RoleTemplate = {
  slug: "owner" | "admin" | "manager" | "staff" | "client" | "guest";
  name: string;
  description: string;
  color: string;
  level: number;
  isDefault: boolean;
  workspacePermissions: readonly WorkspacePermission[];
  cmsPermissions: readonly string[];
};

export const ROLE_TEMPLATES: readonly RoleTemplate[] = [
  {
    slug: "owner",
    name: "Owner",
    description: "Workspace owner (super admin)",
    color: "#111827",
    level: 0,
    isDefault: false,
    workspacePermissions: ["*"],
    cmsPermissions: [
      "system.admin",
      "system.manage_users",
      "workspace.manage",
      "workspace.invite_members",
      "content.create",
      "content.edit",
      "content.publish",
      "content.delete",
      "features.manage",
      "features.install",
      "users.view",
      "users.manage",
      "settings.view",
      "settings.manage",
      "navigation.manage",
      "storage.upload",
      "storage.manage",
      "storage.view",
      "cart.use",
      "cart.checkout",
      "currency.manage",
      "currency.update_rates",
      "wishlist:manage",
    ],
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Full access except system-level actions",
    color: "#dc2626",
    level: 10,
    isDefault: false,
    workspacePermissions: [
      PERMS.MANAGE_WORKSPACE,
      PERMS.MANAGE_MEMBERS,
      PERMS.INVITE_MEMBERS,
      PERMS.MANAGE_ROLES,
      PERMS.MANAGE_MENUS,
      PERMS.DOCUMENTS_CREATE,
      PERMS.DOCUMENTS_EDIT,
      PERMS.DOCUMENTS_DELETE,
      PERMS.DOCUMENTS_MANAGE,
      PERMS.CREATE_CONVERSATIONS,
      PERMS.MANAGE_CONVERSATIONS,
      PERMS.VIEW_WORKSPACE,
      PERMS.COMMUNICATIONS_VIEW,
      // Feature-level permissions
      PERMS.CALENDAR_VIEW, PERMS.CALENDAR_MANAGE,
      PERMS.CALLS_VIEW, PERMS.CALLS_MANAGE,
      PERMS.COMMENTS_VIEW, PERMS.COMMENTS_MANAGE,
      PERMS.CONTACTS_VIEW, PERMS.CONTACTS_MANAGE,
      PERMS.FORMS_VIEW, PERMS.FORMS_MANAGE,
      PERMS.INTEGRATIONS_VIEW, PERMS.INTEGRATIONS_MANAGE,
      PERMS.NOTIFICATIONS_VIEW, PERMS.NOTIFICATIONS_MANAGE,
      PERMS.POS_VIEW, PERMS.POS_MANAGE,
      PERMS.SEARCH_VIEW,
      PERMS.STATUS_VIEW, PERMS.STATUS_MANAGE,
      PERMS.SUPPORT_VIEW, PERMS.SUPPORT_MANAGE,
      PERMS.TAGS_VIEW, PERMS.TAGS_MANAGE,
      PERMS.WIKI_VIEW, PERMS.WIKI_MANAGE,
      PERMS.ANALYTICS_VIEW, PERMS.ANALYTICS_MANAGE,
    ],
    cmsPermissions: [
      "system.manage_users",
      "workspace.manage",
      "workspace.invite_members",
      "content.create",
      "content.edit",
      "content.publish",
      "content.delete",
      "features.manage",
      "features.install",
      "users.view",
      "users.manage",
      "settings.view",
      "settings.manage",
      "navigation.manage",
      "storage.upload",
      "storage.manage",
      "storage.view",
      "cart.use",
      "cart.checkout",
      "currency.manage",
      "currency.update_rates",
      "wishlist:manage",
    ],
  },
  {
    slug: "manager",
    name: "Manager",
    description: "Manage content and conversations",
    color: "#2563eb",
    level: 30,
    isDefault: false,
    workspacePermissions: [
      PERMS.DOCUMENTS_CREATE,
      PERMS.DOCUMENTS_EDIT,
      PERMS.CREATE_CONVERSATIONS,
      PERMS.MANAGE_CONVERSATIONS,
      PERMS.VIEW_WORKSPACE,
      PERMS.COMMUNICATIONS_VIEW,
      // Feature-level permissions
      PERMS.CALENDAR_VIEW, PERMS.CALENDAR_MANAGE,
      PERMS.CALLS_VIEW, PERMS.CALLS_MANAGE,
      PERMS.COMMENTS_VIEW, PERMS.COMMENTS_MANAGE,
      PERMS.CONTACTS_VIEW, PERMS.CONTACTS_MANAGE,
      PERMS.FORMS_VIEW, PERMS.FORMS_MANAGE,
      PERMS.NOTIFICATIONS_VIEW, PERMS.NOTIFICATIONS_MANAGE,
      PERMS.SEARCH_VIEW,
      PERMS.STATUS_VIEW, PERMS.STATUS_MANAGE,
      PERMS.SUPPORT_VIEW, PERMS.SUPPORT_MANAGE,
      PERMS.TAGS_VIEW, PERMS.TAGS_MANAGE,
      PERMS.WIKI_VIEW, PERMS.WIKI_MANAGE,
      PERMS.ANALYTICS_VIEW, PERMS.ANALYTICS_MANAGE,
    ],
    cmsPermissions: [
      "workspace.manage",
      "workspace.invite_members",
      "content.create",
      "content.edit",
      "content.publish",
      "features.manage",
      "settings.view",
      "navigation.manage",
      "storage.upload",
      "storage.manage",
      "storage.view",
      "cart.use",
      "currency.manage",
      "currency.update_rates",
      "wishlist:manage",
    ],
  },
  {
    slug: "staff",
    name: "Staff",
    description: "Contribute content and chat",
    color: "#10b981",
    level: 50,
    isDefault: false,
    workspacePermissions: [
      PERMS.DOCUMENTS_CREATE,
      PERMS.DOCUMENTS_EDIT,
      PERMS.CREATE_CONVERSATIONS,
      PERMS.VIEW_WORKSPACE,
      PERMS.COMMUNICATIONS_VIEW,
      // Feature-level permissions (staff can contribute to all features)
      PERMS.CALENDAR_VIEW, PERMS.CALENDAR_MANAGE,
      PERMS.CALLS_VIEW, PERMS.CALLS_MANAGE,
      PERMS.COMMENTS_VIEW, PERMS.COMMENTS_MANAGE,
      PERMS.CONTACTS_VIEW, PERMS.CONTACTS_MANAGE,
      PERMS.FORMS_VIEW, PERMS.FORMS_MANAGE,
      PERMS.NOTIFICATIONS_VIEW,
      PERMS.SEARCH_VIEW,
      PERMS.STATUS_VIEW, PERMS.STATUS_MANAGE,
      PERMS.SUPPORT_VIEW, PERMS.SUPPORT_MANAGE,
      PERMS.TAGS_VIEW, PERMS.TAGS_MANAGE,
      PERMS.WIKI_VIEW, PERMS.WIKI_MANAGE,
      PERMS.ANALYTICS_VIEW,
    ],
    cmsPermissions: [
      "content.create",
      "content.edit",
      "settings.view",
      "navigation.manage",
      "storage.upload",
      "storage.view",
      "cart.use",
      "wishlist:manage",
    ],
  },
  {
    slug: "client",
    name: "Client",
    description: "Limited access; cannot view member list",
    color: "#6b7280",
    level: 70,
    isDefault: true,
    workspacePermissions: [
      PERMS.CREATE_CONVERSATIONS,
      PERMS.VIEW_WORKSPACE,
      PERMS.COMMUNICATIONS_VIEW,
      PERMS.SEARCH_VIEW,
      PERMS.NOTIFICATIONS_VIEW,
      PERMS.COMMENTS_VIEW,
      PERMS.SUPPORT_VIEW,
      PERMS.TAGS_VIEW,
    ],
    cmsPermissions: ["settings.view", "storage.view", "cart.use"],
  },
  {
    slug: "guest",
    name: "Guest",
    description: "Read-only viewer",
    color: "#9ca3af",
    level: 90,
    isDefault: false,
    workspacePermissions: [
      PERMS.VIEW_WORKSPACE,
      PERMS.SEARCH_VIEW,
    ],
    cmsPermissions: ["settings.view"],
  },
] as const;

export const ROLE_TEMPLATE_MAP = new Map(
  ROLE_TEMPLATES.map((template) => [template.slug, template]),
);

export const CMS_ROLE_PERMISSIONS = ROLE_TEMPLATES.reduce(
  (acc, template) => {
    acc[template.slug] = template.cmsPermissions;
    return acc;
  },
  {} as Record<RoleTemplate["slug"], readonly string[]>,
) as Readonly<Record<RoleTemplate["slug"], readonly string[]>>;

/**
 * Tiered role presets — choose by use-case.
 *
 * Pick which slugs to seed when a workspace is created. Single source of
 * truth so the same flag drives both initial seed and the role-management
 * UI (which slugs can a workspace owner add later).
 *
 *   solo         — personal-brand-os, indie projects. Owner = everything.
 *                  No other roles needed; "admin" optional in case the
 *                  user adds a co-admin later.
 *   influencer   — solo + manager (e.g. virtual assistant managing posts /
 *                  inbox). Owner stays the brand; manager has content +
 *                  member-management rights.
 *   organization — full 6-role ladder (owner / admin / manager / staff /
 *                  client / guest). For company / institution / agency.
 */
export type RbacTier = "solo" | "influencer" | "organization";

export const RBAC_TIER_PRESETS: Readonly<Record<RbacTier, readonly RoleTemplate["slug"][]>> = {
  solo: ["owner", "admin"],
  influencer: ["owner", "admin", "manager"],
  organization: ["owner", "admin", "manager", "staff", "client", "guest"],
} as const;

/** Resolve a tier → the RoleTemplate objects to seed. */
export function getRoleTemplatesForTier(tier: RbacTier): readonly RoleTemplate[] {
  const slugs = RBAC_TIER_PRESETS[tier];
  return ROLE_TEMPLATES.filter((t) => slugs.includes(t.slug));
}

