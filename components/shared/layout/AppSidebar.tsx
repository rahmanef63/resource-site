"use client";

// AppSidebar — registry-driven sidebar for any consumer that wraps their
// admin shell with the slice runtime. Reads `getRegistry()` and groups by
// slice category.
//
// Usage:
//   import "@/lib/shared/features/registry.generated"; // bootstraps once
//   import { AppSidebar } from "@/shared/layout/AppSidebar";
//   <AppSidebar groups={["payment","auth","data"]} />
//
// This is intentionally smaller than superspace's AppSidebar — it doesn't
// carry workspace switching, pinned items, user menus, etc. Consumers that
// need those bolt them on; the slice registry handle stays the same.

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getRegistry, type RegisteredSlice } from "@/lib/shared/features/registry";
import type { SliceCategory } from "@/lib/shared/features/defineFeature";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  /** Optional category filter — only render slices in these groups. */
  groups?: Array<SliceCategory | "tools" | "settings">;
  /** Optional title shown above the nav. */
  title?: string;
};

export function AppSidebar({ groups, title }: AppSidebarProps) {
  const pathname = usePathname();
  const registry = safeGetRegistry();

  const navSlices = registry.filter((s) => !!s.nav);
  const filtered = groups
    ? navSlices.filter((s) => s.nav && groups.includes(s.nav.group))
    : navSlices;

  const grouped = React.useMemo(() => groupByCategory(filtered, groups), [filtered, groups]);

  if (filtered.length === 0) {
    return (
      <nav className="flex flex-col gap-2 px-3 py-4 text-sm text-muted-foreground">
        {title && <div className="px-2 font-semibold text-foreground">{title}</div>}
        <p className="px-2 text-xs">
          No slices registered yet.{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
            npx rahman-resources add &lt;slice&gt;
          </code>
        </p>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {title && (
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
      )}
      {Array.from(grouped.entries()).map(([group, slices]) => (
        <CategoryGroup key={group} group={group} slices={slices} pathname={pathname} />
      ))}
    </nav>
  );
}

function CategoryGroup({
  group,
  slices,
  pathname,
}: {
  group: string;
  slices: RegisteredSlice[];
  pathname: string;
}) {
  const containsActive = slices.some((s) => primaryHref(s) === pathname);
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-0.5 flex h-6 items-center gap-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ChevronRight
          className={cn("size-3 transition-transform", open && "rotate-90")}
          aria-hidden
        />
        <span className="flex-1 text-left">{group}</span>
        <span className="tabular-nums text-muted-foreground/70">{slices.length}</span>
      </button>
      {open && (
        <ul className="flex flex-col">
          {slices.map((slice) => {
            const href = primaryHref(slice);
            const active = href === pathname;
            return (
              <li key={slice.slug}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-7 items-center rounded-md px-2 text-[13px] transition-colors",
                    active
                      ? "bg-blue-500/15 font-medium text-blue-700 dark:text-blue-300"
                      : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                  )}
                >
                  <span className="flex-1 truncate">
                    {slice.nav?.label ?? slice.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function primaryHref(slice: RegisteredSlice): string {
  return slice.routes?.[0]?.path ?? `/${slice.slug}`;
}

function groupByCategory(
  slices: RegisteredSlice[],
  ordering?: AppSidebarProps["groups"],
) {
  const groups = new Map<string, RegisteredSlice[]>();
  for (const s of slices) {
    const g = s.nav?.group ?? s.category;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(s);
  }
  if (!ordering) return groups;
  // Reorder to match `ordering` argument
  const sorted = new Map<string, RegisteredSlice[]>();
  for (const g of ordering) {
    if (groups.has(g)) sorted.set(g, groups.get(g)!);
  }
  for (const [g, list] of groups) {
    if (!sorted.has(g)) sorted.set(g, list);
  }
  return sorted;
}

function safeGetRegistry(): RegisteredSlice[] {
  try {
    return getRegistry();
  } catch {
    return [];
  }
}
