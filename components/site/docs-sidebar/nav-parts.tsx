"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  branchContainsActive,
  isActive,
  sectionContainsActive,
  type NavBranch,
  type NavLeaf,
  type NavSection,
} from "./nav-types";

/**
 * Tier 0 — section header. Wraps shadcn `SidebarGroup` in a
 * `Collapsible` so the whole group folds away under one chevron when
 * the user doesn't need it. Keeps groups containing the active path
 * forced open. */
export function SectionGroup({
  section,
  pathname,
}: {
  section: NavSection;
  pathname: string;
}) {
  const containsActive = sectionContainsActive(section, pathname);
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarGroup>
        <CollapsibleTrigger className="w-full">
          <SidebarGroupLabel
            className="group/section flex w-full cursor-pointer items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
            data-active={containsActive ? "" : undefined}
          >
            <ChevronRight className="size-3.5 shrink-0 transition-transform group-data-[state=open]/section:rotate-90 data-[state=open]:rotate-90" />
            <span className="flex-1 text-left">{section.label}</span>
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) =>
                item.kind === "leaf" ? (
                  <SidebarMenuItem key={item.href}>
                    <SidebarLeafButton leaf={item} pathname={pathname} />
                  </SidebarMenuItem>
                ) : (
                  <BranchItem key={item.title} branch={item} pathname={pathname} />
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

/** Tier 1 — branch (collapsible menu item with nested leafs). Uses
 *  shadcn `SidebarMenuItem` + `SidebarMenuSub`. */
export function BranchItem({
  branch,
  pathname,
}: {
  branch: NavBranch;
  pathname: string;
}) {
  const containsActive = branchContainsActive(branch, pathname);
  const [open, setOpen] = React.useState(containsActive);
  React.useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  return (
    <Collapsible asChild open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={containsActive}
            tooltip={branch.title}
            className="font-semibold"
          >
            <ChevronRight className="size-4 shrink-0 transition-transform data-[state=open]:rotate-90" data-state={open ? "open" : "closed"} />
            <span className="flex-1 truncate text-left">{branch.title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <SidebarMenuBadge className="tabular-nums">
          {branch.items.length}
        </SidebarMenuBadge>
        <CollapsibleContent>
          <SidebarMenuSub>
            {branch.items.map((leaf) => (
              <SidebarMenuSubItem key={leaf.href}>
                <SidebarLeafSubButton leaf={leaf} pathname={pathname} />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

/** Tier 1 — leaf directly under a section group. Uses shadcn
 *  `SidebarMenuButton`. */
function SidebarLeafButton({
  leaf,
  pathname,
}: {
  leaf: NavLeaf;
  pathname: string;
}) {
  const active = isActive(pathname, leaf.href);
  return (
    <SidebarMenuButton
      asChild
      isActive={active}
      tooltip={leaf.title}
      aria-disabled={leaf.disabled}
      className={leaf.disabled ? "pointer-events-none opacity-50" : undefined}
    >
      <Link href={leaf.disabled ? "#" : leaf.href}>
        <span className="flex-1 truncate">{leaf.title}</span>
        {leaf.badge && (
          <SidebarMenuBadge className="ml-auto">{leaf.badge}</SidebarMenuBadge>
        )}
      </Link>
    </SidebarMenuButton>
  );
}

/** Tier 2 — leaf nested under a branch. Uses shadcn
 *  `SidebarMenuSubButton`. */
function SidebarLeafSubButton({
  leaf,
  pathname,
}: {
  leaf: NavLeaf;
  pathname: string;
}) {
  const active = isActive(pathname, leaf.href);
  return (
    <SidebarMenuSubButton
      asChild
      isActive={active}
      aria-disabled={leaf.disabled}
      className={leaf.disabled ? "pointer-events-none opacity-50" : undefined}
    >
      <Link href={leaf.disabled ? "#" : leaf.href}>
        <span className="flex-1 truncate">{leaf.title}</span>
        {leaf.badge && (
          <SidebarMenuBadge className="ml-auto">{leaf.badge}</SidebarMenuBadge>
        )}
      </Link>
    </SidebarMenuSubButton>
  );
}

/** Re-export for old import paths. */
export { SidebarLeafButton as LeafLink };
