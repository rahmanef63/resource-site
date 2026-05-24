import {
  BookOpen,
  Briefcase,
  CalendarDays,
  FileSignature,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LineChart,
  Newspaper,
  Receipt,
  ScrollText,
  Settings,
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
  { label: "Case Studies", href: `${PUBLIC_BASE}/case-studies` },
  { label: "Insights", href: `${PUBLIC_BASE}/insights` },
  { label: "Team", href: `${PUBLIC_BASE}/team` },
  { label: "FAQ", href: `${PUBLIC_BASE}/faq` },
  { label: "Contact", href: `${PUBLIC_BASE}/contact` },
];

export const PUBLIC_CTA = { label: "Konsultasi gratis", href: `${PUBLIC_BASE}/contact` };

export const FOOTER_COLUMNS: FooterColumn[] = [
  { heading: "Site", items: PUBLIC_NAV },
  {
    heading: "Resources",
    items: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export const FOOTER_TAGLINE = "Built with Konsultan OS";

export const OWNER_USER: User = {
  name: DEFAULT_SITE_CONFIG.ownerName,
  role: DEFAULT_SITE_CONFIG.ownerRole,
  initials: DEFAULT_SITE_CONFIG.ownerInitials,
  email: DEFAULT_SITE_CONFIG.email,
};

export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  const draftProposals = state.proposals.filter((p) => p.status === "draft" || p.status === "sent").length;
  const overdueInvoices = state.invoices.filter((i) => i.status === "overdue" || i.status === "sent").length;
  const activeProjects = state.projects.filter((p) => p.status !== "delivered").length;
  const customPages = state.pages.filter((p) => !p.systemPage).length;
  const enabledLanding = state.landingSections.filter((s) => s.enabled).length;
  const upcomingEvents = state.calendarEvents.length;
  const publishedKb = state.kbArticles.filter((a) => a.status === "published").length;
  return [
    { id: "dashboard",  label: "Dashboard",  href: ADMIN_BASE,                   icon: LayoutDashboard, count: null },
    // "Pages" parent — collapsible group bundling every content surface
    // that maps to a public page. Konsultan only ships landing + custom
    // pages publicly; everything else (proposals, contracts, billing,
    // documents) is internal CRM.
    {
      id: "pages",
      label: "Pages",
      href: `${ADMIN_BASE}/pages`,
      icon: Newspaper,
      count: customPages || null,
      children: [
        { id: "pages-all",     label: "All pages",    href: `${ADMIN_BASE}/pages`,   icon: Newspaper,      count: customPages || null },
        { id: "pages-landing", label: "Landing page", href: `${ADMIN_BASE}/landing`, icon: LayoutTemplate, count: enabledLanding || null },
        // BF-wave — dynamic custom pages (every admin-created page shows here).
        ...buildCustomPageNavItems(state.pages, `${ADMIN_BASE}/pages`),
      ],
    },
    { id: "clients",    label: "Clients",    href: `${ADMIN_BASE}/clients`,      icon: Users,           count: state.clients.length },
    { id: "proposals",  label: "Proposals",  href: `${ADMIN_BASE}/proposals`,    icon: FileText,        count: draftProposals || null },
    { id: "contracts",  label: "Contracts",  href: `${ADMIN_BASE}/contracts`,    icon: FileSignature,   count: state.contracts.length },
    { id: "projects",   label: "Projects",   href: `${ADMIN_BASE}/projects`,     icon: Briefcase,       count: activeProjects || null },
    { id: "calendar",   label: "Calendar",   href: `${ADMIN_BASE}/calendar`,     icon: CalendarDays,    count: upcomingEvents || null },
    { id: "billing",    label: "Billing",    href: `${ADMIN_BASE}/billing`,      icon: Receipt,         count: overdueInvoices || null },
    { id: "documents",  label: "Documents",  href: `${ADMIN_BASE}/documents`,    icon: ScrollText,      count: state.documents.length },
    { id: "knowledge-base", label: "Knowledge Base", href: `${ADMIN_BASE}/knowledge-base`, icon: BookOpen, count: publishedKb || null },
    { id: "analytics",  label: "Analytics",  href: `${ADMIN_BASE}/analytics`,    icon: LineChart,       count: null },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "ai",   label: "AI Config", href: `${ADMIN_BASE}/settings`, icon: Wand2 },
  { id: "site", label: "Site",      href: `${ADMIN_BASE}/settings`, icon: Settings },
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
