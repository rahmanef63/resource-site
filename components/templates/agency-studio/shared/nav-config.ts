// Per-template nav config for Agency Studio OS.

import {
  BookOpen,
  Briefcase,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  LineChart,
  Mail,
  MessageSquare,
  Newspaper,
  Settings,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import type { AdminNavGroup, AdminNavItem, FooterColumn, NavItem, User } from "@/components/templates/_shared/types/common";
import type { State } from "./types";
import { DEFAULT_SITE_CONFIG, TEMPLATE_SLUG } from "./site-config";
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
  { label: "Services", href: `${PUBLIC_BASE}/services` },
  { label: "Work", href: `${PUBLIC_BASE}/portfolio` },
  { label: "Process", href: `${PUBLIC_BASE}/process` },
  { label: "Journal", href: `${PUBLIC_BASE}/journal` },
  { label: "Team", href: `${PUBLIC_BASE}/team` },
  { label: "About", href: `${PUBLIC_BASE}/about` },
  { label: "Contact", href: `${PUBLIC_BASE}/contact` },
];

export const PUBLIC_CTA = { label: "Start a project", href: DEFAULT_SITE_CONFIG.bookCallHref };

export const FOOTER_COLUMNS: FooterColumn[] = [
  { heading: "Studio", items: PUBLIC_NAV },
  {
    heading: "Office",
    items: [
      { label: DEFAULT_SITE_CONFIG.email, href: `mailto:${DEFAULT_SITE_CONFIG.email}` },
      { label: `Founded ${DEFAULT_SITE_CONFIG.studioFounded}`, href: "#" },
      { label: "Jakarta · remote-first", href: "#" },
    ],
  },
];

export const FOOTER_TAGLINE = "Built with Agency Studio OS";

export const OWNER_USER: User = {
  name: "Asti R.",
  role: "studio principal",
  initials: "AR",
};

export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  const activeProjects = state.projects.filter((p) => p.status !== "delivered" && p.status !== "archived").length;
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const activeClients = state.clients.filter((c) => c.status === "active").length;
  const customPages = state.pages.filter((p) => !p.systemPage).length;
  const enabledLanding = state.landingSections.filter((s) => s.enabled).length;
  const draftArticles = state.articles.filter((a) => a.status !== "published").length;
  const pendingComments = state.comments.filter((c) => c.status === "pending").length;
  const pendingSubs = state.subscribers.filter((s) => s.status === "pending").length;
  return [
    { id: "dashboard", label: "Dashboard", href: ADMIN_BASE,                  icon: LayoutDashboard, count: null },
    // "Pages" parent — collapsible group bundling every content surface
    // that maps to a public page (landing, work/portfolio, services, journal).
    // Each child reuses an existing CRUD route.
    {
      id: "pages",
      label: "Pages",
      href: `${ADMIN_BASE}/pages`,
      icon: Newspaper,
      count: customPages || null,
      children: [
        { id: "pages-all",      label: "All pages",    href: `${ADMIN_BASE}/pages`,    icon: Newspaper,      count: customPages || null },
        { id: "pages-landing",  label: "Landing page", href: `${ADMIN_BASE}/landing`,  icon: LayoutTemplate, count: enabledLanding || null },
        { id: "pages-projects", label: "Work",         href: `${ADMIN_BASE}/projects`, icon: Briefcase,      count: activeProjects || null },
        { id: "pages-services", label: "Services",     href: `${ADMIN_BASE}/services`, icon: Sparkles,       count: state.services.length || null },
        { id: "pages-journal",  label: "Journal",      href: `${ADMIN_BASE}/journal-editor`, icon: BookOpen, count: draftArticles || null },
        // BF-wave — dynamic custom pages (every admin-created page shows here).
        ...buildCustomPageNavItems(state.pages, `${ADMIN_BASE}/pages`),
      ],
    },
    { id: "clients",    label: "Clients",    href: `${ADMIN_BASE}/clients`,    icon: Users,         count: activeClients || null },
    { id: "leads",      label: "Leads",      href: `${ADMIN_BASE}/leads`,      icon: Inbox,         count: newLeads || null },
    { id: "comments",   label: "Comments",   href: `${ADMIN_BASE}/comments`,   icon: MessageSquare, count: pendingComments || null },
    { id: "newsletter", label: "Newsletter", href: `${ADMIN_BASE}/newsletter`, icon: Mail,          count: pendingSubs || null },
    { id: "analytics",  label: "Analytics",  href: `${ADMIN_BASE}/analytics`,  icon: LineChart,     count: null },
    { id: "ai-config",  label: "AI Config",  href: `${ADMIN_BASE}/ai-config`,  icon: Wand2,         count: null },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "studio", label: "Studio", href: `${ADMIN_BASE}/settings`, icon: Settings },
];


/**
 * BG-wave — grouped admin nav: [Overview, Pages, Features, Admin Panel].
 * Pages = CMS items (every admin route bound to a public surface).
 * Features = template-specific domain entities (clients / leads / etc).
 * Admin Panel = cross-template operational tools (AI / Analytics /
 * Users / Audit / Webhooks / Settings) — same blocks every template.
 *
 * Derives from the legacy flat `buildAdminPrimaryNav` so the source
 * of truth for per-template items stays in one place.
 */
export function buildAdminNav(state: State): AdminNavGroup[] {
  const flat = buildAdminPrimaryNav(state);
  const dashboard = flat.find((i) => i.id === "dashboard");
  const pagesParent = flat.find((i) => i.id === "pages");
  const features = flat.filter((i) => i.id !== "dashboard" && i.id !== "pages");
  const groups: AdminNavGroup[] = [];
  if (dashboard) groups.push({ id: "overview", label: "Overview", homeAware: true, items: [dashboard] });
  if (pagesParent?.children?.length) {
    groups.push({ id: "pages", label: "Pages", items: pagesParent.children });
  }
  if (features.length) groups.push({ id: "features", label: "Features", items: features });
  groups.push({ id: "admin-panel", label: "Admin Panel", items: buildAdminPanelNav(ADMIN_BASE) });
  return groups;
}
