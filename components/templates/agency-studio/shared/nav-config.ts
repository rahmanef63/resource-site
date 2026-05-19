// Per-template nav config for Agency Studio OS.

import {
  Briefcase,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  Newspaper,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import type { AdminNavItem, FooterColumn, NavItem, User } from "@/components/templates/_shared/types/common";
import type { State } from "./types";
import { DEFAULT_SITE_CONFIG } from "./site-config";

export const PUBLIC_BASE = "/preview/agency-studio-os/public";
export const ADMIN_BASE = "/preview/agency-studio-os/admin";

export const PUBLIC_NAV: NavItem[] = [
  { label: "Services", href: `${PUBLIC_BASE}/services` },
  { label: "Work", href: `${PUBLIC_BASE}/portfolio` },
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
  return [
    { id: "dashboard", label: "Dashboard", href: ADMIN_BASE,                  icon: LayoutDashboard, count: null },
    { id: "landing",   label: "Landing",   href: `${ADMIN_BASE}/landing`,     icon: LayoutTemplate,  count: state.landingSections.filter((s) => s.enabled).length || null },
    { id: "pages",     label: "Pages",     href: `${ADMIN_BASE}/pages`,       icon: Newspaper,       count: customPages || null },
    { id: "projects",  label: "Projects",  href: `${ADMIN_BASE}/projects`,    icon: Briefcase,       count: activeProjects || null },
    { id: "clients",   label: "Clients",   href: `${ADMIN_BASE}/clients`,     icon: Users,           count: activeClients || null },
    { id: "services",  label: "Services",  href: `${ADMIN_BASE}/services`,    icon: Sparkles,        count: state.services.length },
    { id: "leads",     label: "Leads",     href: `${ADMIN_BASE}/leads`,       icon: Inbox,           count: newLeads || null },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "studio", label: "Studio", href: `${ADMIN_BASE}/settings`, icon: Settings },
];
