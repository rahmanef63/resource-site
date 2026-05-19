"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, ExternalLink, LayoutGrid } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { Brand, DashboardSection } from "../types/common";

type Props = {
  brand: Pick<Brand, "brandLetter" | "brandName">;
  templateName: string;
  sections: DashboardSection[];
  activeId: string;
  /** Footer link target — usually `/preview` so operators can swap templates */
  catalogHref?: string;
};

/**
 * Sidebar-header workspace switcher mounted at the top of the
 * `DashboardShell` sidebar. Improved adaptation of the shadcn
 * sidebar-07 `TeamSwitcher` pattern with: per-section description,
 * keyboard shortcut hints (⌘1 / ⌘2 …), active-item check mark, and a
 * "Switch template" catalog escape hatch in the footer. Inspired by
 * notion-page-clone WorkspaceSwitcher (role-gated menu) and
 * superspace EnhancedWorkspaceSwitcher (hierarchical context).
 */
export function DashboardSwitcher({
  brand,
  templateName,
  sections,
  activeId,
  catalogHref = "/templates",
}: Props) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  // ⌘1 / ⌘2 … keyboard shortcuts. We hard-bind 1..9 to the first 9
  // sections so adding a third section (e.g. Team) gets a shortcut for
  // free. Skip when typing in an editable field.
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return;
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      const idx = Number(e.key) - 1;
      if (idx < 0 || idx >= sections.length || idx > 8) return;
      e.preventDefault();
      router.push(sections[idx].href);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sections, router]);

  const ActiveIcon = active.icon;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid aspect-square size-8 shrink-0 place-items-center rounded-md bg-foreground text-sm font-bold text-background">
                {ActiveIcon ? <ActiveIcon className="size-4" /> : brand.brandLetter}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{templateName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {active.label}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-72"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {brand.brandName} · {templateName}
            </DropdownMenuLabel>
            {sections.map((section, i) => {
              const Icon = section.icon;
              const isActive = section.id === active.id;
              return (
                <DropdownMenuItem
                  key={section.id}
                  onSelect={() => router.push(section.href)}
                  className={cn(
                    "flex items-start gap-2 px-2 py-2",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <div className="grid size-7 shrink-0 place-items-center rounded-md border bg-background">
                    {Icon ? <Icon className="size-3.5" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{section.label}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  {isActive ? (
                    <Check className="size-3.5 shrink-0 text-foreground" />
                  ) : null}
                  {section.shortcut || i < 9 ? (
                    <DropdownMenuShortcut className="ml-1">
                      {section.shortcut ?? `⌘${i + 1}`}
                    </DropdownMenuShortcut>
                  ) : null}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push(catalogHref)}>
              <LayoutGrid className="size-3.5" />
              <span className="text-sm">Switch template</span>
              <ExternalLink className="ml-auto size-3.5 opacity-60" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
