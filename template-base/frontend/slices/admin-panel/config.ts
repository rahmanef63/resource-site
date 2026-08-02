import { defineFeature } from "@/frontend/shared/lib/features/defineFeature";

/**
 * Admin Panel — unified product admin surface.
 *
 * Visibility:
 *   - Platform admin (env PLATFORM_ADMIN_EMAILS) → always sees it.
 *   - Workspace owner → always sees it for their workspace.
 *   - Other roles → only if granted PLATFORM_ADMIN permission via
 *     workspaceMemberships.additionalPermissions.
 *
 * Order: 999 so it sits at the very bottom of every sidebar.
 */
export default defineFeature({
  id: "admin",
  name: "Admin Panel",
  description:
    "Owner / super-admin command center: events, funnels, users, A/B, flags, pricing, CMS, email, audit.",

  ui: {
    icon: "Shield",
    path: "/admin",
    component: "AdminPage",
    category: "administration",
    order: 999,
  },

  technical: {
    featureType: "system",
    hasUI: true,
    hasConvex: true,
    hasTests: false,
    version: "0.1.0",
  },

  status: {
    state: "development",
    isReady: false,
  },

  tags: ["admin", "owner", "platform", "rbac", "instrumentation"],
  permissions: ["PLATFORM_ADMIN"],
});

/**
 * Admin sub-section registry. Each entry is a tab/route under /admin.
 * Permission gates here mirror what the backend mutations enforce.
 */
export interface AdminSection {
  id: string;
  label: string;
  icon: string;
  path: string;
  /** Required permission OR special token `OWNER` / `PLATFORM_ADMIN`. */
  required: string;
  /** Which tier surfaces this section by default. */
  tiers: ReadonlyArray<"solo" | "influencer" | "organization">;
  /** P-tier from the spec; for docs / order. */
  priority: "P0" | "P1" | "P2";
}

export const ADMIN_SECTIONS: readonly AdminSection[] = [
  // ───── P0 instrumentation ─────
  { id: "events",       label: "Events",        icon: "Activity",   path: "/admin/events",       required: "events.read",       tiers: ["solo", "influencer", "organization"], priority: "P0" },
  { id: "funnels",      label: "Funnels",       icon: "TrendingUp", path: "/admin/funnels",      required: "analytics.view",    tiers: ["solo", "influencer", "organization"], priority: "P0" },
  { id: "attribution",  label: "Attribution",   icon: "Compass",    path: "/admin/attribution",  required: "analytics.view",    tiers: ["solo", "influencer", "organization"], priority: "P0" },
  { id: "activation",   label: "Activation",    icon: "Sparkles",   path: "/admin/activation",   required: "analytics.view",    tiers: ["solo", "influencer", "organization"], priority: "P0" },

  // ───── P1 users + experiments ─────
  { id: "users",        label: "Users",         icon: "Users",      path: "/admin/users",        required: "manage_members",    tiers: ["influencer", "organization"],          priority: "P1" },
  { id: "cohorts",      label: "Cohorts",       icon: "Layers",     path: "/admin/cohorts",      required: "analytics.view",    tiers: ["organization"],                        priority: "P1" },
  { id: "ab-tests",     label: "A/B Tests",     icon: "FlaskConical",path: "/admin/ab-tests",    required: "experiments.manage",tiers: ["influencer", "organization"],          priority: "P1" },
  { id: "feature-flags",label: "Feature Flags", icon: "Flag",       path: "/admin/feature-flags",required: "flags.manage",      tiers: ["solo", "influencer", "organization"], priority: "P1" },
  { id: "pricing",      label: "Pricing",       icon: "DollarSign", path: "/admin/pricing",      required: "pricing.manage",    tiers: ["influencer", "organization"],          priority: "P1" },
  { id: "cms",          label: "Landing CMS",   icon: "LayoutTemplate",path: "/admin/cms",       required: "content.manage",    tiers: ["solo", "influencer", "organization"], priority: "P1" },
  { id: "email",        label: "Email",         icon: "Mail",       path: "/admin/email",        required: "email.manage",      tiers: ["solo", "influencer", "organization"], priority: "P1" },

  // ───── P2 ops ─────
  { id: "activity",     label: "Live Activity", icon: "Radio",      path: "/admin/activity",     required: "PLATFORM_ADMIN",    tiers: ["influencer", "organization"],          priority: "P2" },
  { id: "errors",       label: "Errors",        icon: "AlertTriangle",path: "/admin/errors",     required: "PLATFORM_ADMIN",    tiers: ["organization"],                        priority: "P2" },
  { id: "marketing",    label: "Marketing Data",icon: "Megaphone",  path: "/admin/marketing",    required: "analytics.view",    tiers: ["influencer", "organization"],          priority: "P2" },
  { id: "exports",      label: "Exports",       icon: "Download",   path: "/admin/exports",      required: "PLATFORM_ADMIN",    tiers: ["organization"],                        priority: "P2" },
  { id: "audit",        label: "Audit Log",     icon: "ScrollText", path: "/admin/audit",        required: "audit.view",        tiers: ["influencer", "organization"],          priority: "P2" },
  { id: "roles",        label: "Roles",         icon: "GitBranch",  path: "/admin/roles",        required: "manage_roles",      tiers: ["organization"],                        priority: "P1" },
  { id: "settings",     label: "Settings",      icon: "Settings",   path: "/admin/settings",     required: "OWNER",             tiers: ["solo", "influencer", "organization"], priority: "P1" },
] as const;
