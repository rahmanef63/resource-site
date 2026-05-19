import { LayoutPanelLeft, ShieldCheck } from "lucide-react";
import type { DashboardSection } from "../types/common";

/**
 * Default dashboard-section set: Admin Panel + Workspace. Per-template
 * `nav-config.ts` calls this with its own `ADMIN_PANEL_BASE` /
 * `WORKSPACE_BASE` constants. Templates that want to extend (e.g. add
 * a Team or Analytics section) can spread the result and append.
 */
export function buildDashboardSections(opts: {
  adminPanelHref: string;
  workspaceHref: string;
}): DashboardSection[] {
  return [
    {
      id: "admin",
      label: "Admin Panel",
      description: "Headless CMS — pages, content, settings",
      href: opts.adminPanelHref,
      icon: ShieldCheck,
    },
    {
      id: "workspace",
      label: "Workspace",
      description: "Productivity — editor, calendar, tools",
      href: opts.workspaceHref,
      icon: LayoutPanelLeft,
    },
  ];
}

/**
 * Derive the active section id from a Next pathname. Returns "workspace"
 * when the path contains `/dashboard/workspace`, otherwise defaults to
 * "admin" (the legacy + most common surface).
 */
export function activeSectionFromPathname(pathname: string | null | undefined): "admin" | "workspace" {
  if (!pathname) return "admin";
  if (pathname.includes("/dashboard/workspace")) return "workspace";
  return "admin";
}
