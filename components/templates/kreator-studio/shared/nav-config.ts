import {
  CalendarDays,
  FileImage,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LineChart,
  Mail,
  MessageSquare,
  Mic,
  Settings,
  Wand2,
} from "lucide-react";
import type { AdminNavItem, FooterColumn, NavItem, User } from "@/components/templates/_shared/types/common";
import type { State } from "./types";
import { DEFAULT_SITE_CONFIG } from "./site-config";

export const PUBLIC_BASE = "/preview/kreator-studio-os/public";
export const ADMIN_BASE = "/preview/kreator-studio-os/admin";

export const PUBLIC_NAV: NavItem[] = [
  { label: "Posts", href: `${PUBLIC_BASE}/posts` },
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
  return [
    { id: "dashboard",  label: "Dashboard",   href: ADMIN_BASE,                    icon: LayoutDashboard, count: null },
    { id: "planner",    label: "Planner",     href: `${ADMIN_BASE}/planner`,       icon: CalendarDays,    count: drafts || null },
    { id: "voice",      label: "Voice",       href: `${ADMIN_BASE}/voice`,         icon: Mic,             count: state.voices.length },
    { id: "scripts",    label: "Scripts",     href: `${ADMIN_BASE}/scripts`,       icon: FileText,        count: state.scripts.length },
    { id: "carousels",  label: "Carousels",   href: `${ADMIN_BASE}/carousels`,     icon: FileImage,       count: state.carousels.length },
    { id: "assets",     label: "Assets",      href: `${ADMIN_BASE}/assets`,        icon: ImageIcon,       count: state.assets.length },
    { id: "performance",label: "Performance", href: `${ADMIN_BASE}/performance`,   icon: LineChart,       count: null },
    { id: "newsletter", label: "Newsletter",  href: `${ADMIN_BASE}/newsletter`,    icon: Mail,            count: newsletterDrafts || null },
    { id: "comments",   label: "Comments",    href: `${ADMIN_BASE}/comments`,      icon: MessageSquare,   count: pendingComments || null },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "ai",   label: "AI Config", href: `${ADMIN_BASE}/settings`, icon: Wand2 },
  { id: "site", label: "Site",      href: `${ADMIN_BASE}/settings`, icon: Settings },
];
