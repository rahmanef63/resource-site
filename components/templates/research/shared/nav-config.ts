import {
  BarChart3,
  BookOpen,
  Bot,
  Database,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LayoutTemplate,
  Library,
  Newspaper,
  Quote,
  Settings,
  StickyNote,
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
  { label: "Library", href: `${PUBLIC_BASE}/library` },
  { label: "Publications", href: `${PUBLIC_BASE}/publications` },
  { label: "Insights", href: `${PUBLIC_BASE}/insights` },
  { label: "Citations", href: `${PUBLIC_BASE}/citations` },
  { label: "Reading list", href: `${PUBLIC_BASE}/reading-list` },
  { label: "About", href: `${PUBLIC_BASE}/about` },
];

export const PUBLIC_CTA = { label: "Buka workspace", href: ADMIN_BASE };

export const FOOTER_COLUMNS: FooterColumn[] = [
  { heading: "Site", items: PUBLIC_NAV },
  {
    heading: "Resources",
    items: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "RSS", href: "#" },
      { label: "llms.txt", href: "#" },
    ],
  },
];

export const FOOTER_TAGLINE = "Built with Riset Kit";

export const OWNER_USER: User = {
  name: DEFAULT_SITE_CONFIG.ownerName,
  role: DEFAULT_SITE_CONFIG.ownerRole,
  initials: DEFAULT_SITE_CONFIG.ownerInitials,
  email: DEFAULT_SITE_CONFIG.email,
};

export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  const newDocs = state.documents.filter((d) => d.status === "uploaded").length;
  const customPages = state.pages.filter((p) => !p.systemPage).length;
  const enabledLanding = state.landingSections.filter((s) => s.enabled).length;
  return [
    { id: "dashboard", label: "Dashboard",   href: ADMIN_BASE,                   icon: LayoutDashboard, count: null },
    // "Pages" parent — collapsible group bundling every content surface
    // that maps to a public page. Riset Kit only ships landing + custom
    // pages publicly; documents/notes/citations/ai-reader/lit-review are
    // internal research workspace entities.
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
    { id: "analytics",    label: "Analytics",    href: `${ADMIN_BASE}/analytics`,    icon: BarChart3,    count: null },
    { id: "projects",     label: "Projects",     href: `${ADMIN_BASE}/projects`,     icon: FlaskConical, count: state.projects.length },
    { id: "documents",    label: "Documents",    href: `${ADMIN_BASE}/documents`,    icon: FileText,     count: newDocs || null },
    { id: "datasets",     label: "Datasets",     href: `${ADMIN_BASE}/datasets`,     icon: Database,     count: state.datasets.length },
    { id: "notes",        label: "Notes",        href: `${ADMIN_BASE}/notes`,        icon: StickyNote,   count: state.notes.length },
    { id: "citations",    label: "Citations",    href: `${ADMIN_BASE}/citations`,    icon: Quote,        count: state.citations.length },
    { id: "ai-reader",    label: "AI Reader",    href: `${ADMIN_BASE}/ai-reader`,    icon: Bot,          count: null },
    { id: "lit-review",   label: "Lit Review",   href: `${ADMIN_BASE}/lit-review`,   icon: Library,      count: state.litReviews.length },
    { id: "collaborators",label: "Collaborators",href: `${ADMIN_BASE}/collaborators`,icon: Users,        count: state.collaborators.length },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "ai",   label: "AI Config", href: `${ADMIN_BASE}/settings`, icon: Wand2 },
  { id: "site", label: "Site",      href: `${ADMIN_BASE}/settings`, icon: Settings },
  { id: "library", label: "Library", href: `${ADMIN_BASE}/settings`, icon: BookOpen },
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
