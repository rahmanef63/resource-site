import {
  CreditCard,
  DollarSign,
  FileText,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Settings,
  Sparkles,
  Users,
  LayoutTemplate,
} from "lucide-react";
import type {
  AdminNavGroup,
  AdminNavItem,
  FooterColumn,
  NavItem,
  User,
} from "@/components/templates/_shared/types/common";
import { DEFAULT_SITE_CONFIG, TEMPLATE_SLUG } from "./site-config";
import type { State } from "./types";
import { buildCustomPageNavItems } from "@/components/templates/_shared/pages/nav-builder";
import { buildAdminPanelNav } from "@/components/templates/_shared/admin-panel/feature-blocks";
import { buildTemplatePaths } from "@/components/templates/_shared/config/template-paths";

const paths = buildTemplatePaths(TEMPLATE_SLUG);
export const PUBLIC_BASE = paths.publicBase;
export const DASHBOARD_BASE = paths.dashboardBase;
export const ADMIN_PANEL_BASE = paths.adminPanelBase;
export const WORKSPACE_BASE = paths.workspaceBase;
/** @deprecated use ADMIN_PANEL_BASE */
export const ADMIN_BASE = ADMIN_PANEL_BASE;

export const PUBLIC_NAV: NavItem[] = [
  { label: "Features",  href: `${PUBLIC_BASE}/features` },
  { label: "Pricing",   href: `${PUBLIC_BASE}/pricing` },
  { label: "Blog",      href: `${PUBLIC_BASE}/blog` },
  { label: "Changelog", href: `${PUBLIC_BASE}/changelog` },
  { label: "About",     href: `${PUBLIC_BASE}/about` },
  { label: "Contact",   href: `${PUBLIC_BASE}/contact` },
];

export const PUBLIC_CTA = DEFAULT_SITE_CONFIG.ctaPrimary;

export const FOOTER_COLUMNS: FooterColumn[] = [
  { heading: "Product", items: PUBLIC_NAV.slice(0, 4) },
  { heading: "Company", items: PUBLIC_NAV.slice(4) },
  {
    heading: "Connect",
    items: [
      { label: DEFAULT_SITE_CONFIG.email,   href: `mailto:${DEFAULT_SITE_CONFIG.email}` },
      { label: DEFAULT_SITE_CONFIG.twitter, href: `https://twitter.com/${DEFAULT_SITE_CONFIG.twitter.replace("@", "")}` },
    ],
  },
];

export const FOOTER_TAGLINE = "Built with SaaS Marketing OS";

export const OWNER_USER: User = {
  name: "Maya K.",
  role: "growth lead",
  initials: "MK",
};

/**
 * BE-wave grouped admin nav. Returns [Pages, Features, Settings] —
 * each group renders as a labeled `<SidebarGroup>` in the admin
 * sidebar (separate from the AZ-wave's collapsible parent pattern).
 *
 * Pages group = every admin surface that maps to a public route.
 * Features group = everything else (CRM, payments, lead pipeline,
 * project-boost surfaces). Keeps simple/complex CMS work visually
 * isolated so operators don't pick the wrong screen.
 */
export function buildAdminNav(state: State): AdminNavGroup[] {
  const activeSubs = state.subscriptions.filter((s) => s.status === "active").length;
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const draftPosts = state.posts.filter((p) => p.status === "draft").length;
  const activeCustomers = state.customers.filter((c) => c.status === "active").length;
  const customPages = state.pages.filter((p) => !p.systemPage).length;
  const enabledLanding = state.landingSections.filter((s) => s.enabled).length;
  return [
    {
      id: "overview",
      label: "Overview",
      homeAware: true,
      items: [
        { id: "dashboard", label: "Dashboard", href: ADMIN_BASE, icon: LayoutDashboard, count: null },
      ],
    },
    {
      id: "pages",
      label: "Pages",
      items: [
        { id: "pages-all",       label: "All pages",    href: `${ADMIN_BASE}/pages`,     icon: Newspaper,      count: customPages || null },
        { id: "pages-landing",   label: "Landing page", href: `${ADMIN_BASE}/landing`,   icon: LayoutTemplate, count: enabledLanding || null },
        { id: "pages-blog",      label: "Blog",         href: `${ADMIN_BASE}/posts`,     icon: FileText,       count: draftPosts || null },
        { id: "pages-pricing",   label: "Pricing",      href: `${ADMIN_BASE}/pricing`,   icon: DollarSign,     count: state.pricing.length || null },
        { id: "pages-features",  label: "Features",     href: `${ADMIN_BASE}/features`,  icon: Sparkles,       count: state.features.length || null },
        { id: "pages-changelog", label: "Changelog",    href: `${ADMIN_BASE}/changelog`, icon: Megaphone,      count: state.changelogEntries.length || null },
        // BF-wave — dynamic custom pages. Every page created via admin
        // appears here automatically (alphabetic). Drafts + published
        // both shown so authors find their work-in-progress.
        ...buildCustomPageNavItems(state.pages, `${ADMIN_BASE}/pages`),
      ],
    },
    {
      id: "features",
      label: "Features",
      items: [
        { id: "customers",     label: "Customers",     href: `${ADMIN_BASE}/customers`,     icon: Users,      count: activeCustomers || null },
        { id: "subscriptions", label: "Subscriptions", href: `${ADMIN_BASE}/subscriptions`, icon: CreditCard, count: activeSubs || null },
        { id: "leads",         label: "Leads",         href: `${ADMIN_BASE}/leads`,         icon: Inbox,      count: newLeads || null },
      ],
    },
    {
      id: "admin-panel",
      label: "Admin Panel",
      items: buildAdminPanelNav(ADMIN_BASE),
    },
  ];
}

/** @deprecated BE-wave — use {@link buildAdminNav}. Kept for any caller
 *  outside this template that still passes the flat shape. */
export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  return buildAdminNav(state).flatMap((g) => g.items);
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "workspace", label: "Workspace", href: `${ADMIN_BASE}/settings`, icon: Settings },
];
