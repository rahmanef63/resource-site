"use client";

/**
 * Variant preview (VP wave) — rr-internal, stripped on `rr add`.
 * Renders the REAL shell (no mock chrome): the desktop scenarios mount
 * <DashboardShell>, the mobile scenario mounts the real <MobileDock> with its
 * `md:hidden` overridden so it stays visible inside the desktop preview frame.
 */

import { FileText, Home, Image as ImageIcon, Settings, Users } from "lucide-react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardShell } from "./components/dashboard-shell";
import { MobileDock } from "./components/mobile-dock";
import { deriveDock } from "./lib/nav";
import type { NavGroup } from "./lib/types";

/** Generic demo nav — also imported by the full-page preview route. */
export const DEMO_NAV: NavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "home", label: "Home", icon: Home, href: "/app", exact: true, dock: true },
      { id: "posts", label: "Posts", icon: FileText, href: "/app/posts", dock: true, badge: "4" },
      { id: "media", label: "Media", icon: ImageIcon, href: "/app/media", dock: true },
      { id: "team", label: "Team", icon: Users, href: "/app/team" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [{ id: "settings", label: "Settings", icon: Settings, href: "/app/settings" }],
  },
];

const BRAND = { name: "Acme", caption: "Workspace" };

function Body({ label }: { label: string }) {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

const preview: SlicePreviewModule = {
  DashboardShell: ({ variant }) => {
    if (variant.scenario === "mobile-dock") {
      return (
        <SidebarProvider className="min-h-0">
          <div className="relative mx-auto h-[420px] w-full max-w-[360px] transform-gpu overflow-hidden rounded-xl border bg-background">
            <Body label="page content" />
            <MobileDock
              items={deriveDock(DEMO_NAV)}
              pathname="/app/posts"
              className="absolute inset-x-0 bottom-0 md:block"
            />
          </div>
        </SidebarProvider>
      );
    }

    // transform-gpu = containing block for the shell's position:fixed sidebar,
    // so the rail stays inside this box. Real apps mount the shell at page root.
    return (
      <div className="h-[460px] transform-gpu overflow-hidden rounded-lg border">
        <DashboardShell
          brand={BRAND}
          nav={DEMO_NAV}
          activePath="/app/posts"
          className="min-h-0 [&_[data-slot=sidebar-inset]]:min-h-0"
          secondary={
            variant.scenario === "secondary" ? (
              <div className="space-y-1 p-3 text-sm">
                <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Sections</p>
                {["Drafts", "Scheduled", "Published"].map((s) => (
                  <p key={s} className="rounded-md px-2 py-1.5 hover:bg-muted">
                    {s}
                  </p>
                ))}
              </div>
            ) : undefined
          }
        >
          <Body label="page content" />
        </DashboardShell>
      </div>
    );
  },
};

export default preview;
