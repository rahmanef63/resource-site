import {
  BookOpen,
  Bot,
  FileText,
  LayoutDashboard,
  Library,
  Quote,
  Settings,
  StickyNote,
  Wand2,
} from "lucide-react";
import type { AdminNavItem, FooterColumn, NavItem, User } from "@/components/templates/_shared/types/common";
import type { State } from "./types";
import { DEFAULT_SITE_CONFIG } from "./site-config";

export const PUBLIC_BASE = "/preview/riset-kit/public";
export const ADMIN_BASE = "/preview/riset-kit/admin";

export const PUBLIC_NAV: NavItem[] = [
  { label: "Library", href: `${PUBLIC_BASE}/library` },
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
  return [
    { id: "dashboard", label: "Dashboard",   href: ADMIN_BASE,                   icon: LayoutDashboard, count: null },
    { id: "documents", label: "Documents",   href: `${ADMIN_BASE}/documents`,    icon: FileText,        count: newDocs || null },
    { id: "notes",     label: "Notes",       href: `${ADMIN_BASE}/notes`,        icon: StickyNote,      count: state.notes.length },
    { id: "citations", label: "Citations",   href: `${ADMIN_BASE}/citations`,    icon: Quote,           count: state.citations.length },
    { id: "ai-reader", label: "AI Reader",   href: `${ADMIN_BASE}/ai-reader`,    icon: Bot,             count: null },
    { id: "lit-review",label: "Lit Review",  href: `${ADMIN_BASE}/lit-review`,   icon: Library,         count: state.litReviews.length },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "ai",   label: "AI Config", href: `${ADMIN_BASE}/settings`, icon: Wand2 },
  { id: "site", label: "Site",      href: `${ADMIN_BASE}/settings`, icon: Settings },
  { id: "library", label: "Library", href: `${ADMIN_BASE}/settings`, icon: BookOpen },
];
