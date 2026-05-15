"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { layouts, type LayoutEntry } from "@/lib/content/layouts";
import { recipes } from "@/lib/content/recipes";
import { slices, type SliceEntry } from "@/lib/content/slices";
import { cn } from "@/lib/utils";

// 3-tier nav model:
//  - NavSection (group label, collapsible)
//    - NavBranch (collapsible menu item with children)
//      - NavLeaf (leaf link)
//    - NavLeaf (leaf link directly under group)

type NavLeaf = { kind: "leaf"; title: string; href: string; badge?: string; disabled?: boolean };
type NavBranch = { kind: "branch"; title: string; badge?: string; items: NavLeaf[] };
type NavNode = NavLeaf | NavBranch;
type NavSection = { label: string; items: NavNode[] };

// ─── data shaping ─────────────────────────────────────────────────────────

const LAYOUT_CATEGORY_TITLE: Record<Exclude<LayoutEntry["category"], "website-template">, string> = {
  marketing: "Marketing",
  dashboard: "Dashboard",
  cms: "CMS",
  template: "Templates",
};

function groupByCategory<T, K extends string>(items: T[], key: (t: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const it of items) {
    const k = key(it);
    (out[k] ||= []).push(it);
  }
  return out;
}

function buildSections(): NavSection[] {
  const websiteTemplates = layouts.filter((l) => l.category === "website-template");
  const otherLayouts = layouts.filter((l) => l.category !== "website-template");
  const layoutsByCat = groupByCategory(
    otherLayouts,
    (l) => l.category as Exclude<LayoutEntry["category"], "website-template">,
  );
  const slicesByCat = groupByCategory(slices, (s) => s.category as string);
  const SLICE_CATEGORY_ORDER = ["auth", "payment", "ai", "email", "data", "search", "realtime", "content", "storage", "ui", "infra"];

  return [
    {
      label: "Get Started",
      items: [
        { kind: "leaf", title: "Introduction", href: "/docs" },
        { kind: "leaf", title: "Installation", href: "/installation" },
        { kind: "leaf", title: "Architecture", href: "/architecture" },
        { kind: "leaf", title: "Stack", href: "/stack" },
        { kind: "leaf", title: "Directory", href: "/directory" },
        { kind: "leaf", title: "Install with Agent", href: "/agents", badge: "new" },
        { kind: "leaf", title: "Bundle Builder", href: "/build", badge: "new" },
        { kind: "leaf", title: "MCP server", href: "/mcp", badge: "new" },
        { kind: "leaf", title: "VPS Control Room", href: "/control-room", badge: "new" },
      ],
    },
    {
      label: "Website Templates",
      items: [
        { kind: "leaf", title: "All website templates", href: "/templates", badge: "new" },
        ...websiteTemplates.map(
          (l): NavLeaf => ({ kind: "leaf", title: l.title, href: `/layouts/${l.slug}` }),
        ),
      ],
    },
    {
      label: "Layouts",
      items: [
        { kind: "leaf", title: "All layouts", href: "/layouts" },
        ...Object.entries(layoutsByCat)
          .filter(([, list]) => list.length > 0)
          .map(([cat, list]): NavBranch => ({
            kind: "branch",
            title: LAYOUT_CATEGORY_TITLE[cat as keyof typeof LAYOUT_CATEGORY_TITLE] ?? cat,
            items: list.map((l) => ({ kind: "leaf", title: l.title, href: `/layouts/${l.slug}` })),
          })),
      ],
    },
    {
      label: "Slices",
      items: [
        { kind: "leaf", title: "All slices", href: "/slices", badge: "new" },
        ...SLICE_CATEGORY_ORDER.filter((cat) => slicesByCat[cat]?.length).map(
          (cat): NavBranch => ({
            kind: "branch",
            title: cat.charAt(0).toUpperCase() + cat.slice(1),
            items: slicesByCat[cat].map(
              (s: SliceEntry): NavLeaf => ({
                kind: "leaf",
                title: s.title,
                href: `/slices/${s.slug}`,
              }),
            ),
          }),
        ),
      ],
    },
    {
      label: "Recipes",
      items: [
        { kind: "leaf", title: "All recipes", href: "/recipes" },
        ...recipes.map(
          (r): NavLeaf => ({ kind: "leaf", title: r.title, href: `/recipes/${r.slug}` }),
        ),
      ],
    },
  ];
}

// ─── active-path resolution ───────────────────────────────────────────────

function isActive(pathname: string, href: string) {
  return pathname === href;
}

function leafContainsActive(leaf: NavLeaf, pathname: string) {
  return isActive(pathname, leaf.href);
}

function branchContainsActive(branch: NavBranch, pathname: string) {
  return branch.items.some((l) => leafContainsActive(l, pathname));
}

function sectionContainsActive(section: NavSection, pathname: string) {
  return section.items.some((n) =>
    n.kind === "leaf" ? leafContainsActive(n, pathname) : branchContainsActive(n, pathname),
  );
}

// ─── component ────────────────────────────────────────────────────────────

export function DocsSidebar() {
  const pathname = usePathname();
  const sections = React.useMemo(() => buildSections(), []);

  return (
    <nav className="flex flex-col gap-4 px-3 pt-6 pb-8">
      {sections.map((section) => (
        <SectionGroup key={section.label} section={section} pathname={pathname} />
      ))}
    </nav>
  );
}

function SectionGroup({ section, pathname }: { section: NavSection; pathname: string }) {
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

function BranchItem({ branch, pathname }: { branch: NavBranch; pathname: string }) {
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

function LeafLink({
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
