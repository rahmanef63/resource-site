import {
  LayoutDashboard,
  LayoutTemplate,
  Newspaper,
  Settings,
  Sparkles,
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
  { label: "Snippets", href: `${PUBLIC_BASE}/snippets` },
  { label: "Pages", href: `${PUBLIC_BASE}/pages` },
];

export const PUBLIC_CTA = DEFAULT_SITE_CONFIG.ctaPrimary;

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    items: [
      { label: "Snippets", href: `${PUBLIC_BASE}/snippets` },
      { label: "Pages", href: `${PUBLIC_BASE}/pages` },
    ],
  },
  {
    heading: "Built with",
    items: [
      { label: "notion-shell slice", href: "/slices/notion-shell" },
      { label: "landing-sections slice", href: "/slices/landing-sections" },
      { label: "Rahman Resources", href: "/" },
    ],
  },
];

export const FOOTER_TAGLINE = "Built with Nosion OS template";

export const OWNER_USER: User = {
  name: "Owner",
  email: DEFAULT_SITE_CONFIG.email,
  initials: "OW",
  role: "owner",
};

export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  const customPages = state.pages.filter((p) => !p.systemPage).length;
  const enabledLanding = state.landingSections.filter((s) => s.enabled).length;
  const publishedSnippets = state.snippets.filter((s) => s.published).length;
  return [
    { id: "dashboard", label: "Dashboard", href: ADMIN_BASE, icon: LayoutDashboard, count: null },
    // AV-wave nested "Pages" parent — collapsible group bundling every
    // content surface that maps to a public page (landing, snippets,
    // custom pages). Each child reuses an existing CRUD route.
    {
      id: "pages",
      label: "Pages",
      href: `${ADMIN_BASE}/pages`,
      icon: Newspaper,
      count: (customPages + publishedSnippets + enabledLanding) || null,
      children: [
        { id: "pages-landing",  label: "Landing page", href: `${ADMIN_BASE}/landing`,  icon: LayoutTemplate, count: enabledLanding || null },
        { id: "pages-snippets", label: "Snippets",     href: `${ADMIN_BASE}/snippets`, icon: Sparkles,       count: publishedSnippets || null },
        { id: "pages-all",      label: "All pages",    href: `${ADMIN_BASE}/pages`,    icon: Newspaper,      count: customPages || null },
        // BF-wave — dynamic custom pages (every admin-created page shows here).
        ...buildCustomPageNavItems(state.pages, `${ADMIN_BASE}/pages`),
      ],
    },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "settings", label: "Settings", href: `${ADMIN_BASE}/settings`, icon: Settings, count: null },
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
