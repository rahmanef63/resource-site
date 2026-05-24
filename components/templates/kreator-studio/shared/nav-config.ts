import {
  BarChart3,
  CalendarDays,
  DollarSign,
  FileImage,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  LineChart,
  Mail,
  MessageSquare,
  Mic,
  Newspaper,
  Settings,
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
  { label: "Posts", href: `${PUBLIC_BASE}/posts` },
  { label: "Journal", href: `${PUBLIC_BASE}/journal` },
  { label: "Showcase", href: `${PUBLIC_BASE}/showcase` },
  { label: "Testimonials", href: `${PUBLIC_BASE}/testimonials` },
  { label: "Pricing", href: `${PUBLIC_BASE}/pricing` },
  { label: "About", href: `${PUBLIC_BASE}/about` },
];

export const PUBLIC_CTA = { label: "Subscribe", href: PUBLIC_BASE };

export const FOOTER_COLUMNS: FooterColumn[] = [
  { heading: "Site", items: PUBLIC_NAV },
  {
    heading: "Resources",
    items: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "RSS", href: "#" },
    ],
  },
];

export const FOOTER_TAGLINE = "Built with Kreator Studio";

export const OWNER_USER: User = {
  name: DEFAULT_SITE_CONFIG.ownerName,
  role: DEFAULT_SITE_CONFIG.ownerRole,
  initials: DEFAULT_SITE_CONFIG.ownerInitials,
  email: DEFAULT_SITE_CONFIG.email,
};

export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  const drafts = state.contents.filter((c) => c.status !== "published").length;
  const newsletterDrafts = state.newsletters.filter((n) => n.status !== "sent").length;
  const pendingComments = state.commentDrafts.filter((c) => c.status === "draft").length;
  const customPages = state.pages.filter((p) => !p.systemPage).length;
  const enabledLanding = state.landingSections.filter((s) => s.enabled).length;
  return [
    { id: "dashboard",  label: "Dashboard",   href: ADMIN_BASE,                    icon: LayoutDashboard, count: null },
    // "Pages" parent — collapsible group bundling every content surface
    // that maps to a public page. Kreator Studio publishes landing +
    // custom pages; planner/voice/scripts/carousels/assets are
    // production tooling (feed posts but don't render as their own
    // public route here).
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
    { id: "planner",    label: "Planner",     href: `${ADMIN_BASE}/planner`,       icon: CalendarDays,    count: drafts || null },
    { id: "voice",      label: "Voice",       href: `${ADMIN_BASE}/voice`,         icon: Mic,             count: state.voices.length },
    { id: "scripts",    label: "Scripts",     href: `${ADMIN_BASE}/scripts`,       icon: FileText,        count: state.scripts.length },
    { id: "carousels",  label: "Carousels",   href: `${ADMIN_BASE}/carousels`,     icon: FileImage,       count: state.carousels.length },
    { id: "assets",     label: "Assets",      href: `${ADMIN_BASE}/assets`,        icon: ImageIcon,       count: state.assets.length },
    { id: "performance",label: "Performance", href: `${ADMIN_BASE}/performance`,   icon: LineChart,       count: null },
    { id: "analytics",  label: "Analytics",   href: `${ADMIN_BASE}/analytics`,     icon: BarChart3,       count: null },
    { id: "monetization",label: "Monetization",href: `${ADMIN_BASE}/monetization`, icon: DollarSign,      count: null },
    { id: "newsletter", label: "Newsletter",  href: `${ADMIN_BASE}/newsletter`,    icon: Mail,            count: newsletterDrafts || null },
    { id: "comments",   label: "Comments",    href: `${ADMIN_BASE}/comments`,      icon: MessageSquare,   count: pendingComments || null },
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
