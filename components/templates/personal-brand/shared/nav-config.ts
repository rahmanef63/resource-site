// Per-template nav config. Imported by app/preview layouts and any slice
// that needs PUBLIC_BASE / ADMIN_BASE constants.
//
// NOTE: `/preview/personal-brand-os/*` is the rr sandbox path. Consumers
// installing via `npx rr add personal-brand-os` (default `--at root`) get
// these constants auto-rewritten to "" / "/admin" by the CLI's
// `rewritePreviewPaths()` step — so edits below stay on the rr side.

import {
  BookOpen,
  Bot,
  Briefcase,
  FileText,
  Inbox,
  LayoutDashboard,
  LineChart,
  Mail,
  MessageSquare,
  Newspaper,
  Settings,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import type { AdminNavItem, FooterColumn, NavItem, User } from "@/components/templates/_shared/types/common";
import type { State } from "./types";
import { DEFAULT_SITE_CONFIG } from "./site-config";

export const PUBLIC_BASE = "/preview/personal-brand-os/public";
export const ADMIN_BASE = "/preview/personal-brand-os/admin";

export const PUBLIC_NAV: NavItem[] = [
  { label: "About", href: `${PUBLIC_BASE}/about` },
  { label: "Blog", href: `${PUBLIC_BASE}/blog` },
  { label: "Portfolio", href: `${PUBLIC_BASE}/portfolio` },
  { label: "Services", href: `${PUBLIC_BASE}/services` },
  { label: "Resources", href: `${PUBLIC_BASE}/resources` },
  { label: "Contact", href: `${PUBLIC_BASE}/contact` },
];

export const PUBLIC_CTA = { label: "Book a call", href: `${PUBLIC_BASE}/services` };

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Site",
    items: PUBLIC_NAV,
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "RSS", href: "#" },
      { label: "llms.txt", href: "#" },
    ],
  },
];

export const FOOTER_TAGLINE = "Built with Personal Brand OS";

export const OWNER_USER: User = {
  name: DEFAULT_SITE_CONFIG.ownerName,
  role: DEFAULT_SITE_CONFIG.ownerRole,
  initials: DEFAULT_SITE_CONFIG.ownerInitials,
  email: DEFAULT_SITE_CONFIG.email,
};

/**
 * Build admin primary nav with live counts from the store. Pass the current
 * state from useStore() inside the layout (sidebar reads these reactively).
 */
export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  const draftCount = state.posts.filter((p) => p.status !== "published").length;
  const pendingComments = state.comments.filter((c) => c.status === "pending").length;
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const flaggedChats = state.chatSessions.filter((s) => s.flagged).length;
  const pendingSubs = state.subscribers.filter((s) => s.status === "pending").length;
  const customPages = state.pages.filter((p) => !p.systemPage).length;
  return [
    { id: "dashboard", label: "Dashboard", href: ADMIN_BASE,                  icon: LayoutDashboard, count: null },
    { id: "pages",     label: "Pages",     href: `${ADMIN_BASE}/pages`,       icon: Newspaper,       count: customPages || null },
    { id: "posts",     label: "Posts",     href: `${ADMIN_BASE}/posts`,       icon: FileText,        count: draftCount || null },
    { id: "portfolio", label: "Portfolio", href: `${ADMIN_BASE}/portfolio`,   icon: Briefcase,       count: state.portfolio.length },
    { id: "services",  label: "Services",  href: `${ADMIN_BASE}/services`,    icon: Sparkles,        count: state.services.length },
    { id: "resources", label: "Resources", href: `${ADMIN_BASE}/resources`,   icon: BookOpen,        count: state.resources.length },
    { id: "leads",     label: "Leads",     href: `${ADMIN_BASE}/leads`,       icon: Inbox,           count: newLeads || null },
    { id: "newsletter",label: "Newsletter",href: `${ADMIN_BASE}/newsletter`,  icon: Mail,            count: pendingSubs || null },
    { id: "comments",  label: "Comments",  href: `${ADMIN_BASE}/comments`,    icon: MessageSquare,   count: pendingComments || null },
    { id: "chatbot",   label: "Chatbot",   href: `${ADMIN_BASE}/chatbot`,     icon: Bot,             count: flaggedChats || null },
    { id: "analytics", label: "Analytics", href: `${ADMIN_BASE}/analytics`,   icon: LineChart,       count: null },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "ai",   label: "AI Config", href: `${ADMIN_BASE}/settings/ai`,   icon: Wand2 },
  { id: "team", label: "Team",      href: `${ADMIN_BASE}/settings/team`, icon: Users },
  { id: "site", label: "Site",      href: `${ADMIN_BASE}/settings/site`, icon: Settings },
];
