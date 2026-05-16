"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ThreeColumnLayoutAdvanced } from "@/components/previews/three-column/ThreeColumnLayout";
import { DocsSidebar } from "./docs-sidebar";
import { FeatureProvider, useFeatureContext } from "./feature-context";
import { FeatureBar } from "./feature-bar";

/** Universal three-column shell for all docs pages.
 *  - Left  : DocsSidebar (collapsible, persists)
 *  - Center: optional FeatureBar (tabs + responsive controls) + page content
 *  - Right : optional Inspector (closed by default, controlled by feature manifest)
 */
export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <FeatureProvider>
      <DocsShellInner>{children}</DocsShellInner>
    </FeatureProvider>
  );
}

function DocsShellInner({ children }: { children: React.ReactNode }) {
  const { manifest, activeTab, rightOpen, setRightOpen } = useFeatureContext();
  const tabs = manifest?.tabs ?? [];
  const hasTabs = tabs.length > 0;
  const hasInspector = !!manifest?.inspector;

  // Mobile view control. Default to "center" so users landing on any docs
  // route see content first, not the sidebar. Sidebar opens via ChevronLeft
  // in the mobile center header. Snap back to "center" on every navigation
  // so tapping a sidebar link always reveals the new page.
  const pathname = usePathname();
  const [mobileView, setMobileView] = React.useState<"left" | "center">("center");
  React.useEffect(() => {
    setMobileView("center");
  }, [pathname]);

  const activeRender = hasTabs && activeTab
    ? tabs.find((t) => t.id === activeTab)?.render
    : null;

  const center = (
    <div className="flex h-full min-h-0 flex-col">
      {hasTabs ? (
        <>
          {children}
          <FeatureBar />
          <div className="min-h-0 flex-1 overflow-hidden bg-background">
            {activeRender ? activeRender() : null}
          </div>
        </>
      ) : manifest?.wide ? (
        <div className="w-full flex-1 overflow-auto p-6 sm:p-8">{children}</div>
      ) : (
        <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-6 sm:p-8">{children}</div>
      )}
    </div>
  );

  const right = hasInspector ? (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {manifest!.inspector!.title ?? "Inspector"}
        </p>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {manifest!.inspector!.render()}
      </div>
    </div>
  ) : undefined;

  return (
    <div className="h-[calc(100svh-3.5rem)] w-full">
      <ThreeColumnLayoutAdvanced
        left={<DocsSidebar />}
        center={center}
        right={right}
        leftLabel="Docs"
        rightLabel={manifest?.inspector?.title ?? "Inspector"}
        leftWidth={240}
        rightWidth={360}
        centerMinWidth={320}
        defaultLeftCollapsed={false}
        rightCollapsed={!rightOpen}
        onRightCollapsedChange={(collapsed) => setRightOpen(!collapsed)}
        mobileView={mobileView}
        onMobileViewChange={setMobileView}
        showCollapseButtons
        resizable
        persistState
        storageKey="docs-shell-v1"
        tone="layout"
        className="h-full"
      />
    </div>
  );
}
