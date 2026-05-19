// Shared types consumed by all website-templates (T1, T2, T3+).
// Keep this file framework-agnostic — no React imports.

export type Brand = {
  brandLetter: string;
  brandName: string;
  tagline: string;
  description: string;
  baseUrl: string;
  twitter: string;
  email: string;
  defaultLocale: "id-ID" | "en-US";
  themeColor: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type AdminNavItem = NavItem & {
  id: string;
  /** lucide icon component — passed as React.ComponentType to admin shell */
  icon?: any;
  /** small badge count next to nav label */
  count?: number | null;
  /** Nested sub-items. When present, the entry renders as a
   *  Collapsible parent inside the admin SidebarMenu with a
   *  SidebarMenuSub for the children. The parent's `href` is still
   *  navigable (e.g. clicking "Pages" can hit /admin/pages); the
   *  chevron handles expand/collapse independently. */
  children?: AdminNavItem[];
};

export type User = {
  name: string;
  role: string;
  initials: string;
  email?: string;
};

export type Cta = {
  label: string;
  href: string;
};

/**
 * A top-level surface in the operator dashboard. AZ-wave split the
 * old `/admin` into two sibling surfaces — Admin Panel (CMS) and
 * Workspace (productivity). The DashboardSwitcher in the sidebar
 * header lets the operator swap between them; future sections (e.g.
 * Team, Settings) can be added by extending the array per template.
 */
export type DashboardSection = {
  id: "admin" | "workspace" | (string & {});
  label: string;
  description: string;
  href: string;
  /** lucide icon — React.ComponentType */
  icon?: any;
  /** keyboard shortcut hint shown next to label, e.g. "⌘1" */
  shortcut?: string;
};

export type FooterColumn = {
  heading: string;
  items: { label: string; href: string }[];
};
