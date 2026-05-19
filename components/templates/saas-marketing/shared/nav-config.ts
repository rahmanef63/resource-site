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
  AdminNavItem,
  FooterColumn,
  NavItem,
  User,
} from "@/components/templates/_shared/types/common";
import { DEFAULT_SITE_CONFIG } from "./site-config";
import type { State } from "./types";

export const PUBLIC_BASE = "/preview/saas-marketing-os/public";
export const ADMIN_BASE = "/preview/saas-marketing-os/admin";

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

export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  const activeSubs = state.subscriptions.filter((s) => s.status === "active").length;
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const draftPosts = state.posts.filter((p) => p.status === "draft").length;
  const activeCustomers = state.customers.filter((c) => c.status === "active").length;
  const customPages = state.pages.filter((p) => !p.systemPage).length;
  return [
    { id: "dashboard",     label: "Dashboard",     href: ADMIN_BASE,                       icon: LayoutDashboard, count: null },
    { id: "landing",       label: "Landing",       href: `${ADMIN_BASE}/landing`,          icon: LayoutTemplate,  count: state.landingSections.filter((s) => s.enabled).length || null },
    { id: "pages",         label: "Pages",         href: `${ADMIN_BASE}/pages`,            icon: Newspaper,       count: customPages || null },
    { id: "customers",     label: "Customers",     href: `${ADMIN_BASE}/customers`,        icon: Users,           count: activeCustomers || null },
    { id: "subscriptions", label: "Subscriptions", href: `${ADMIN_BASE}/subscriptions`,    icon: CreditCard,      count: activeSubs || null },
    { id: "leads",         label: "Leads",         href: `${ADMIN_BASE}/leads`,            icon: Inbox,           count: newLeads || null },
    { id: "posts",         label: "Posts",         href: `${ADMIN_BASE}/posts`,            icon: FileText,        count: draftPosts || null },
    { id: "features",      label: "Features",      href: `${ADMIN_BASE}/features`,         icon: Sparkles,        count: state.features.length || null },
    { id: "pricing",       label: "Pricing",       href: `${ADMIN_BASE}/pricing`,          icon: DollarSign,      count: state.pricing.length || null },
    { id: "changelog",     label: "Changelog",     href: `${ADMIN_BASE}/changelog`,        icon: Megaphone,       count: state.changelogEntries.length },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "workspace", label: "Workspace", href: `${ADMIN_BASE}/settings`, icon: Settings },
];
