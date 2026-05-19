import {
  Building2,
  LayoutDashboard,
  LayoutTemplate,
  Newspaper,
  Package,
  Receipt,
  ShoppingCart,
  Settings,
  Users,
  Wallet,
  Wand2,
} from "lucide-react";
import type { AdminNavItem, FooterColumn, NavItem, User } from "@/components/templates/_shared/types/common";
import type { State } from "./types";
import { DEFAULT_SITE_CONFIG } from "./site-config";

export const PUBLIC_BASE = "/preview/wirausaha-os/public";
export const ADMIN_BASE = "/preview/wirausaha-os/admin";

export const PUBLIC_NAV: NavItem[] = [
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
      ],
    },
    { id: "businesses", label: "Businesses", href: `${ADMIN_BASE}/businesses`,   icon: Building2,       count: state.businesses.length },
    { id: "inventory",  label: "Inventory",  href: `${ADMIN_BASE}/inventory`,    icon: Package,         count: lowStock || null },
    { id: "orders",     label: "Orders",     href: `${ADMIN_BASE}/orders`,       icon: ShoppingCart,    count: newOrders || null },
    { id: "customers",  label: "Customers",  href: `${ADMIN_BASE}/customers`,    icon: Users,           count: state.customers.length },
    { id: "finance",    label: "Finance",    href: `${ADMIN_BASE}/finance`,      icon: Wallet,          count: null },
    { id: "staff",      label: "Staff",      href: `${ADMIN_BASE}/staff`,        icon: Receipt,         count: state.staff.length },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "ai",   label: "AI Config", href: `${ADMIN_BASE}/settings`, icon: Wand2 },
  { id: "site", label: "Site",      href: `${ADMIN_BASE}/settings`, icon: Settings },
];
