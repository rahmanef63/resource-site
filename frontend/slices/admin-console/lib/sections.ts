/**
 * Admin Console — section catalog + access vocabulary.
 *
 * The canonical "ideal admin panel" is this list: 26 sections harvested from
 * ~15 project admin panels (see docs/admin-panel/COMPARISON.md), each tagged
 * with the rr slice that supplies it (`provider`) or `"self"` for the 5
 * net-new gap sections this slice owns.
 *
 * Pure module — no React, no Convex. Safe in vitest.
 */

export type AdminTier = "solo" | "team" | "org"
export const ALL_TIERS: readonly AdminTier[] = ["solo", "team", "org"]

export type AdminAccessLevel =
  | "platform_admin"
  | "workspace_owner"
  | "workspace_admin"
  | "delegated_admin"
  | "denied"

export interface AdminAccess {
  isLoading: boolean
  level: AdminAccessLevel
  /** Permissions effectively granted in the current workspace. */
  permissions: readonly string[]
  email: string | null
}

/** The 5 gap sections this slice owns; everything else is a reuse mount. */
export type OwnedSectionId =
  | "analytics"
  | "audit-log"
  | "nav-config"
  | "seo-health"
  | "leads"

export interface AdminConsoleSection {
  id: string
  label: string
  /** lucide-react icon NAME, resolved by the shell. */
  icon: string
  group: "observability" | "identity" | "ai" | "content" | "commerce" | "config"
  priority: "P0" | "P1" | "P2"
  /** Permission token, or the special tokens `OWNER` / `PLATFORM_ADMIN`. */
  required: string
  tiers: readonly AdminTier[]
  /** rr slice slug that renders this section, or `"self"` when owned here. */
  provider: string
}

const A = ALL_TIERS

export const ADMIN_CONSOLE_SECTIONS: readonly AdminConsoleSection[] = [
  // ───── observability ─────
  { id: "overview",   label: "Overview",          icon: "LayoutDashboard", group: "observability", priority: "P0", required: "analytics.view", tiers: A,                 provider: "platform-admin" },
  { id: "events",     label: "Events",            icon: "Activity",        group: "observability", priority: "P0", required: "events.read",     tiers: A,                 provider: "event-tracking" },
  { id: "analytics",  label: "Analytics",         icon: "TrendingUp",      group: "observability", priority: "P0", required: "analytics.view",  tiers: A,                 provider: "self" },
  { id: "audit-log",  label: "Audit Log",         icon: "ScrollText",      group: "observability", priority: "P1", required: "audit.view",      tiers: ["team", "org"],   provider: "self" },
  { id: "errors",     label: "Errors & Feedback", icon: "AlertTriangle",   group: "observability", priority: "P2", required: "PLATFORM_ADMIN",  tiers: ["team", "org"],   provider: "notifications-center" },

  // ───── identity ─────
  { id: "users",       label: "Users",       icon: "Users",       group: "identity", priority: "P1", required: "members.manage", tiers: ["team", "org"], provider: "user-management" },
  { id: "roles",       label: "Roles & RBAC",icon: "ShieldCheck", group: "identity", priority: "P1", required: "roles.manage",   tiers: ["org"],         provider: "rbac-roles" },
  { id: "invitations", label: "Invitations", icon: "Mail",        group: "identity", priority: "P1", required: "members.manage", tiers: ["team", "org"], provider: "user-management" },
  { id: "tenants",     label: "Workspaces",  icon: "Building2",   group: "identity", priority: "P2", required: "PLATFORM_ADMIN", tiers: ["org"],         provider: "platform-admin" },

  // ───── ai ─────
  { id: "ai-config", label: "AI Providers", icon: "Sparkles", group: "ai", priority: "P1", required: "ai.manage", tiers: A,               provider: "ai-admin" },
  { id: "ai-usage",  label: "AI Usage",     icon: "Gauge",    group: "ai", priority: "P1", required: "ai.manage", tiers: ["team", "org"], provider: "ai-admin" },

  // ───── content ─────
  { id: "blog",         label: "Blog / Posts",  icon: "FileText",          group: "content", priority: "P1", required: "content.manage", tiers: A, provider: "blog-section" },
  { id: "services",     label: "Services",      icon: "Briefcase",         group: "content", priority: "P1", required: "content.manage", tiers: A, provider: "services" },
  { id: "portfolio",    label: "Portfolio",     icon: "Image",             group: "content", priority: "P1", required: "content.manage", tiers: A, provider: "portfolio-section" },
  { id: "pages",        label: "Pages",         icon: "LayoutTemplate",    group: "content", priority: "P1", required: "content.manage", tiers: A, provider: "pages-cms" },
  { id: "library",      label: "Library",       icon: "Library",           group: "content", priority: "P1", required: "content.manage", tiers: A, provider: "library" },
  { id: "comments",     label: "Comments",      icon: "MessageSquare",     group: "content", priority: "P1", required: "content.manage", tiers: A, provider: "comments" },
  { id: "testimonials", label: "Testimonials",  icon: "Quote",             group: "content", priority: "P2", required: "content.manage", tiers: A, provider: "testimonials" },
  { id: "changelog",    label: "Changelog",     icon: "GitCommitHorizontal",group: "content", priority: "P2", required: "content.manage", tiers: A, provider: "changelog-feed" },
  { id: "media",        label: "Media Library", icon: "ImagePlus",         group: "content", priority: "P1", required: "content.manage", tiers: A, provider: "media-studio" },
  { id: "nav-config",   label: "Navigation",    icon: "Menu",              group: "content", priority: "P1", required: "content.manage", tiers: A, provider: "self" },
  { id: "seo-health",   label: "SEO Health",    icon: "Search",            group: "content", priority: "P1", required: "content.manage", tiers: A, provider: "self" },

  // ───── commerce ─────
  { id: "newsletter", label: "Newsletter",  icon: "Send",  group: "commerce", priority: "P1", required: "email.manage", tiers: A, provider: "resend-newsletter" },
  { id: "leads",      label: "Leads / CRM", icon: "Inbox", group: "commerce", priority: "P1", required: "crm.manage",   tiers: A, provider: "self" },

  // ───── config ─────
  { id: "settings",      label: "Settings",      icon: "Settings", group: "config", priority: "P1", required: "OWNER",          tiers: A, provider: "settings-page" },
  { id: "notifications", label: "Notifications", icon: "Bell",     group: "config", priority: "P2", required: "PLATFORM_ADMIN", tiers: A, provider: "notifications-center" },
] as const

/** slugs referenced by reuse sections — the consumer installs the ones they want. */
export const SECTION_PROVIDERS: readonly string[] = Array.from(
  new Set(ADMIN_CONSOLE_SECTIONS.map((s) => s.provider).filter((p) => p !== "self")),
)
