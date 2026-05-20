import {
  Briefcase,
  FileSignature,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  Newspaper,
  Receipt,
  ScrollText,
  Settings,
  Users,
  Wand2,
} from "lucide-react";
import type { AdminNavItem, FooterColumn, NavItem, User } from "@/components/templates/_shared/types/common";
import type { State } from "./types";
import { DEFAULT_SITE_CONFIG } from "./site-config";
import { buildCustomPageNavItems } from "@/components/templates/_shared/pages/nav-builder";

export const PUBLIC_BASE = "/preview/konsultan-os/public";
export const DASHBOARD_BASE = "/preview/konsultan-os/dashboard";
export const ADMIN_PANEL_BASE = `${DASHBOARD_BASE}/admin`;
export const WORKSPACE_BASE = `${DASHBOARD_BASE}/workspace`;
/** @deprecated use ADMIN_PANEL_BASE */
export const ADMIN_BASE = ADMIN_PANEL_BASE;

export const PUBLIC_NAV: NavItem[] = [
  { label: "Case Studies", href: `${PUBLIC_BASE}/case-studies` },
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
    { id: "billing",    label: "Billing",    href: `${ADMIN_BASE}/billing`,      icon: Receipt,         count: overdueInvoices || null },
    { id: "documents",  label: "Documents",  href: `${ADMIN_BASE}/documents`,    icon: ScrollText,      count: state.documents.length },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "ai",   label: "AI Config", href: `${ADMIN_BASE}/settings`, icon: Wand2 },
  { id: "site", label: "Site",      href: `${ADMIN_BASE}/settings`, icon: Settings },
];
