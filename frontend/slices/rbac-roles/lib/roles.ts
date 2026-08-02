// The 6 system role presets, ported from superspace roles.config.ts.
// `level` ranks roles (0 = highest). Wildcards keep the preset lists
// short; resolve them with matchPermission(). Consumers can seed these
// into the rbac_roles table (seedSystemRoles) and add custom roles.

import type { Permission } from "./permissions";

export type RoleSlug = "owner" | "admin" | "manager" | "staff" | "client" | "guest";

export interface RolePreset {
  slug: RoleSlug;
  name: string;
  description: string;
  color: string; // hex, for RoleBadge dot
  level: number; // 0 = highest authority
  isDefault: boolean; // assigned to new members when no role specified
  permissions: Permission[];
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    slug: "owner", name: "Owner", level: 0, color: "#7c3aed", isDefault: false,
    description: "Full control of the workspace, including deletion and billing.",
    permissions: ["*"],
  },
  {
    slug: "admin", name: "Admin", level: 10, color: "#2563eb", isDefault: false,
    description: "Manage members, roles, content, billing and settings.",
    permissions: [
      "workspace.view", "workspace.manage", "members.*", "roles.*",
      "invitations.manage", "content.*", "database.*", "documents.*",
      "comments.*", "billing.*", "analytics.view", "settings.manage", "audit.view",
    ],
  },
  {
    slug: "manager", name: "Manager", level: 30, color: "#0891b2", isDefault: false,
    description: "Lead content + documents; view members and analytics.",
    permissions: [
      "workspace.view", "members.view", "content.view", "content.create",
      "content.edit", "database.view", "database.create", "database.edit",
      "documents.*", "comments.manage", "analytics.view",
    ],
  },
  {
    slug: "staff", name: "Staff", level: 50, color: "#16a34a", isDefault: false,
    description: "Create + edit content and documents; comment.",
    permissions: [
      "workspace.view", "members.view", "content.view", "content.create",
      "content.edit", "database.view", "documents.view", "documents.create",
      "documents.edit", "comments.view", "comments.create",
    ],
  },
  {
    slug: "client", name: "Client", level: 70, color: "#d97706", isDefault: true,
    description: "View shared content and documents; leave comments.",
    permissions: ["workspace.view", "content.view", "documents.view", "comments.view", "comments.create"],
  },
  {
    slug: "guest", name: "Guest", level: 90, color: "#6b7280", isDefault: false,
    description: "Read-only access to shared content.",
    permissions: ["workspace.view", "content.view"],
  },
];

export const ROLE_MAP: ReadonlyMap<RoleSlug, RolePreset> = new Map(
  ROLE_PRESETS.map((r) => [r.slug, r]),
);
export const ROLE_SLUGS: RoleSlug[] = ROLE_PRESETS.map((r) => r.slug);
export const DEFAULT_ROLE_SLUG: RoleSlug =
  ROLE_PRESETS.find((r) => r.isDefault)?.slug ?? "guest";
