"use client";

import * as React from "react";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { DashboardShell, MobileDock, MobileMenuDrawer, deriveDock } from "@/features/dashboard-shell";
import { DEMO_NAV } from "@/features/dashboard-shell/preview";

function Content() {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        page content
      </div>
    </div>
  );
}

export default function Page() {
  const [viewport, setViewport] = React.useState<"mobile" | "desktop">("desktop");
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <SlicePreviewLayout
      title="Dashboard Shell — Responsive"
      kind="ui"
      description="One `nav` prop drives every face: desktop rail + topbar; mobile has no sidebar at all — a bottom dock plus a thumbnail-tile menu drawer. This preview mounts the real slice — no mock chrome."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/dashboard-shell"
    >
      <PreviewSection title="Live demo" hint="Toggle the viewport">
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["desktop", "mobile"] as const).map((v) => (
            <Button
              key={v}
              variant="ghost"
              type="button"
              onClick={() => setViewport(v)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs capitalize transition",
                viewport === v ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </Button>
          ))}
        </div>

        <div className="flex justify-center rounded-lg border bg-muted/20 p-4 sm:p-6">
          {/* transform-gpu makes this box the containing block for the shell's
              position:fixed sidebar — without it the rail escapes the frame and
              covers the docs page. Real apps mount the shell at the page root. */}
          <div
            className={cn(
              "relative transform-gpu overflow-hidden rounded-lg border bg-background shadow-xl",
              viewport === "mobile" ? "h-[560px] w-[320px]" : "h-[460px] w-full max-w-4xl",
            )}
          >
            {viewport === "desktop" ? (
              <DashboardShell
                brand={{ name: "Acme", caption: "Workspace" }}
                nav={DEMO_NAV}
                activePath="/app/posts"
                className="min-h-0 [&_[data-slot=sidebar-inset]]:min-h-0"
              >
                <Content />
              </DashboardShell>
            ) : (
              /* On mobile there is no sidebar at all: the dock plus the tile
                 drawer its Menu button opens. `md:block` only overrides the
                 dock's `md:hidden` because this phone frame is a box inside a
                 desktop viewport. */
              <SidebarProvider className="min-h-0">
                <div className="absolute inset-0">
                  <Content />
                  <MobileDock
                    items={deriveDock(DEMO_NAV)}
                    pathname="/app/posts"
                    onMenu={() => setMenuOpen(true)}
                    className="absolute inset-x-0 bottom-0 md:block"
                  />
                  <MobileMenuDrawer
                    groups={DEMO_NAV}
                    open={menuOpen}
                    onOpenChange={setMenuOpen}
                    pathname="/app/posts"
                    title="Acme"
                    description="Workspace"
                  />
                </div>
              </SidebarProvider>
            )}
          </div>
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
