"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  branchContainsActive,
  isActive,
  sectionContainsActive,
  type NavBranch,
  type NavLeaf,
  type NavSection,
} from "./nav-types";

export function SectionGroup({
  section,
  pathname,
}: {
  section: NavSection;
  pathname: string;
}) {
  const containsActive = sectionContainsActive(section, pathname);
  const [open, setOpen] = React.useState(true); // groups default open
  // If the active path lives in this section, keep it open even if user toggled
  // (re-open on navigation).
  React.useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          // Tier 0 SECTION — filled chip-style banner so it visually labels the group below
          "group mb-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-bold uppercase tracking-wider transition-colors",
          containsActive
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
      >
        <ChevronRight
          className={cn("size-3.5 transition-transform", open && "rotate-90")}
          aria-hidden
        />
        <span className="flex-1 text-left">{section.label}</span>
      </button>
      {open && (
        <ul className="flex flex-col gap-0.5">
          {section.items.map((item) =>
            item.kind === "leaf" ? (
              <li key={item.href}>
                <LeafLink leaf={item} pathname={pathname} depth={0} />
              </li>
            ) : (
              <li key={item.title}>
                <BranchItem branch={item} pathname={pathname} />
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

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
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          // Tier 1 PARENT — biggest + bold row, full foreground. Reads as a header even when collapsed.
          "group flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent/50",
          containsActive && "bg-accent/30",
        )}
      >
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
          aria-hidden
        />
        <span className="flex-1 truncate text-left">{branch.title}</span>
        <span className="rounded bg-muted px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
          {branch.items.length}
        </span>
        {branch.badge && (
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
            {branch.badge}
          </Badge>
        )}
      </button>
      {open && (
        <ul className="mt-0.5 ml-[15px] flex flex-col gap-0.5 border-l border-border pl-2">
          {branch.items.map((leaf) => (
            <li key={leaf.href}>
              <LeafLink leaf={leaf} pathname={pathname} depth={1} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LeafLink({
  leaf,
  pathname,
  depth,
}: {
  leaf: NavLeaf;
  pathname: string;
  depth: 0 | 1;
}) {
  const active = isActive(pathname, leaf.href);
  return (
    <Link
      href={leaf.disabled ? "#" : leaf.href}
      aria-disabled={leaf.disabled}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2 rounded-md transition-colors",
        // Tier 1 LEAF (direct child of section) vs Tier 2 LEAF (grandchild under a branch).
        // 3-step scale: branch=semibold-14px → leaf-d0=medium-13px → leaf-d1=normal-12px.
        depth === 0
          ? "h-7 px-2 text-[13px] font-medium"
          : "h-7 px-2 text-xs font-normal",
        leaf.disabled
          ? "pointer-events-none opacity-50"
          : active
            ? "bg-primary/15 font-semibold text-primary"
            : depth === 0
              ? "text-foreground/80 hover:bg-accent/50 hover:text-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      {depth === 1 && (
        <span
          aria-hidden
          className={cn(
            "size-1 shrink-0 rounded-full transition-colors",
            active ? "bg-primary" : "bg-muted-foreground/40 group-hover:bg-muted-foreground/80",
          )}
        />
      )}
      <span className="flex-1 truncate">{leaf.title}</span>
      {leaf.badge && (
        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
          {leaf.badge}
        </Badge>
      )}
    </Link>
  );
}
