"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarContent } from "@/components/ui/sidebar";
import { buildSections } from "./docs-sidebar/build-sections";
import { SectionGroup } from "./docs-sidebar/nav-parts";

/**
 * Docs catalog sidebar — populates the left column of docs-shell.
 *
 * Uses shadcn `SidebarProvider` + the `SidebarMenu*` primitive family
 * underneath so the catalog nav inherits the same affordances as the
 * template admin sidebars: tooltip on collapse, mobile drawer, cookie-
 * persisted open state. The provider's wrapping flex layout is
 * overridden via `className` so we stay flush inside the parent
 * ThreeColumnLayoutAdvanced left column — we extend shadcn, we don't
 * fight it.
 */
export function DocsSidebar() {
  const pathname = usePathname();
  const sections = React.useMemo(() => buildSections(), []);

  return (
    <SidebarProvider
      defaultOpen
      className="!min-h-0 !w-full !flex-col"
      style={{ "--sidebar-width": "100%" } as React.CSSProperties}
    >
      <SidebarContent className="flex flex-col gap-2 px-3 pt-6 pb-8">
        {sections.map((section) => (
          <SectionGroup key={section.label} section={section} pathname={pathname} />
        ))}
      </SidebarContent>
    </SidebarProvider>
  );
}
