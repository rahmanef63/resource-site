"use client";

import * as React from "react";
import { ADMIN_SECTIONS, type AdminSection } from "../config";
import { useAdminAccess } from "../hooks/useAdminAccess";

interface AdminShellProps {
  workspaceId: string;
  /** Active tier — drives which sections are shown by default. */
  tier?: "solo" | "influencer" | "organization";
  /** Currently active section id (caller controls routing). */
  activeId?: string;
  /** Slot for the active section's content. */
  children?: React.ReactNode;
  /** Renders each menu item — caller decides whether to use <Link>, button, etc. */
  renderItem?: (section: AdminSection, isActive: boolean) => React.ReactNode;
}

/**
 * Two-column layout for the admin panel:
 *   left   — section list, filtered by tier + user's permissions
 *   right  — active section content (children)
 *
 * Routing is the caller's responsibility — AdminShell only decides what's
 * visible. Wire `renderItem` to Next's <Link> in your app.
 */
export function AdminShell({
  workspaceId,
  tier = "organization",
  activeId,
  children,
  renderItem,
}: AdminShellProps) {
  const access = useAdminAccess(workspaceId);

  const visibleSections = React.useMemo(
    () => ADMIN_SECTIONS.filter((s) => s.tiers.includes(tier)).filter((s) => canSee(s, access)),
    [tier, access],
  );

  if (access.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!access.canSeeAdmin) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8">
        <p className="text-sm font-medium">Admin panel unavailable</p>
        <p className="max-w-md text-center text-xs text-muted-foreground">
          You don't have permission to view this workspace's admin panel. Ask
          the workspace owner to grant you the <code>PLATFORM_ADMIN</code>{" "}
          permission, or set <code>PLATFORM_ADMIN_EMAILS</code> on the
          backend.
        </p>
      </div>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-[220px_1fr]">
      <nav className="flex flex-col gap-0.5 overflow-y-auto border-r border-border bg-muted/30 p-2 text-sm">
        {visibleSections.map((s) =>
          renderItem ? (
            <React.Fragment key={s.id}>{renderItem(s, activeId === s.id)}</React.Fragment>
          ) : (
            <DefaultRow key={s.id} section={s} isActive={activeId === s.id} />
          ),
        )}
      </nav>
      <main className="overflow-y-auto p-4">{children}</main>
    </div>
  );
}

function canSee(section: AdminSection, access: ReturnType<typeof useAdminAccess>): boolean {
  if (access.level === "platform_admin") return true;
  if (section.required === "OWNER") return access.level === "workspace_owner";
  if (section.required === "PLATFORM_ADMIN") {
    return access.level === "workspace_owner";
  }
  return access.permissions.some((p) => {
    if (p === section.required) return true;
    if (p === "*") return true;
    if (p.endsWith(".*") && section.required.startsWith(p.slice(0, -2) + ".")) return true;
    return false;
  });
}

function DefaultRow({ section, isActive }: { section: AdminSection; isActive: boolean }) {
  return (
    <a
      href={section.path}
      className={
        "flex items-center justify-between rounded px-2 py-1.5 transition hover:bg-accent " +
        (isActive ? "bg-accent font-medium" : "")
      }
    >
      <span>{section.label}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {section.priority}
      </span>
    </a>
  );
}
