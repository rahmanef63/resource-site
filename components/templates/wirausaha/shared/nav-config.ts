import {
  BarChart3,
  Building2,
  LayoutDashboard,
  LayoutTemplate,
  Newspaper,
  Package,
  Receipt,
  ShoppingCart,
  Settings,
  Tag,
  Truck,
  Users,
  Wallet,
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
  { label: "Katalog",  href: `${PUBLIC_BASE}/catalog` },
  { label: "Outlet",   href: `${PUBLIC_BASE}/stores` },
  { label: "Jurnal",   href: `${PUBLIC_BASE}/journal` },
  { label: "Testimoni",href: `${PUBLIC_BASE}/testimoni` },
  { label: "Services", href: `${PUBLIC_BASE}/services` },
  { label: "Contact",  href: `${PUBLIC_BASE}/contact` },
];

export const PUBLIC_CTA = { label: "Hubungi kami", href: `${PUBLIC_BASE}/contact` };

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

export const FOOTER_TAGLINE = "Built with Wirausaha OS";

export const OWNER_USER: User = {
  name: DEFAULT_SITE_CONFIG.ownerName,
  role: DEFAULT_SITE_CONFIG.ownerRole,
  initials: DEFAULT_SITE_CONFIG.ownerInitials,
  email: DEFAULT_SITE_CONFIG.email,
};

export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  const newOrders = state.orders.filter((o) => o.status === "new").length;
  const lowStock = state.products.filter((p) => p.stock < 20).length;
  const customPages = state.pages.filter((p) => !p.systemPage).length;
  const enabledLanding = state.landingSections.filter((s) => s.enabled).length;
  const activePromos = state.promotions.filter((p) => p.status === "active").length;
  return [
    { id: "dashboard",  label: "Dashboard",  href: ADMIN_BASE,                   icon: LayoutDashboard, count: null },
    // "Pages" parent — collapsible group bundling every content surface
    // that maps to a public page. Wirausaha OS only ships landing +
    // custom pages publicly; businesses/inventory/orders/finance/staff
    // are internal operations entities.
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
    { id: "businesses", label: "Businesses", href: `${ADMIN_BASE}/businesses`,   icon: Building2,       count: state.businesses.length },
    { id: "inventory",  label: "Inventory",  href: `${ADMIN_BASE}/inventory`,    icon: Package,         count: lowStock || null },
    { id: "suppliers",  label: "Suppliers",  href: `${ADMIN_BASE}/suppliers`,    icon: Truck,           count: state.suppliers.length },
    { id: "orders",     label: "Orders",     href: `${ADMIN_BASE}/orders`,       icon: ShoppingCart,    count: newOrders || null },
    { id: "promotions", label: "Promotions", href: `${ADMIN_BASE}/promotions`,   icon: Tag,             count: activePromos || null },
    { id: "customers",  label: "Customers",  href: `${ADMIN_BASE}/customers`,    icon: Users,           count: state.customers.length },
    { id: "finance",    label: "Finance",    href: `${ADMIN_BASE}/finance`,      icon: Wallet,          count: null },
    { id: "analytics",  label: "Analytics",  href: `${ADMIN_BASE}/analytics`,    icon: BarChart3,       count: null },
    { id: "staff",      label: "Staff",      href: `${ADMIN_BASE}/staff`,        icon: Receipt,         count: state.staff.length },
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
