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

export type FooterColumn = {
  heading: string;
  items: { label: string; href: string }[];
};
