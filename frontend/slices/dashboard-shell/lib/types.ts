import type { ComponentType, ReactNode } from "react";

export type NavIcon = ComponentType<{ className?: string }>;

/** One navigation entry. `href` renders a next/link; `onSelect` a button. */
export interface NavItem {
  id: string;
  label: string;
  icon?: NavIcon;
  href?: string;
  onSelect?: () => void;
  badge?: ReactNode;
  /** Exact-match the active check (default: prefix match on path segments). */
  exact?: boolean;
  /** Force the active state — for button items (`onSelect`) the path can't tell. */
  active?: boolean;
  /** Promote to the mobile dock. No item flagged → dock takes the first few. */
  dock?: boolean;
  /** One level of sub-nav (rendered as a shadcn SidebarMenuSub). */
  items?: NavItem[];
}

export interface NavGroup {
  id: string;
  label?: string;
  items: NavItem[];
}

export interface Brand {
  name: string;
  logo?: ReactNode;
  href?: string;
  /** Small line under the name — plan, workspace, env, whatever. */
  caption?: string;
}
