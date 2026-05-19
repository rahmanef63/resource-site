import {
  LayoutDashboard,
  LayoutTemplate,
  Newspaper,
  Settings,
  Sparkles,
} from "lucide-react";
import type {
  AdminNavItem,
  FooterColumn,
  NavItem,
  User,
} from "@/components/templates/_shared/types/common";
import { DEFAULT_SITE_CONFIG } from "./site-config";
import type { State } from "./types";

export const PUBLIC_BASE = "/preview/notion-page-clone-os/public";
export const ADMIN_BASE = "/preview/notion-page-clone-os/admin";

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
      { label: "notion-blocks slice", href: "/slices/notion-blocks" },
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
      ],
    },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "settings", label: "Settings", href: `${ADMIN_BASE}/settings`, icon: Settings, count: null },
];
