import { layouts, type LayoutEntry } from "@/lib/content/layouts";
import { slices, type SliceEntry } from "@/lib/content/slices";
import type { NavBranch, NavLeaf, NavSection } from "./nav-types";

const LAYOUT_CATEGORY_TITLE: Record<Exclude<LayoutEntry["category"], "website-template">, string> = {
  marketing: "Marketing",
  dashboard: "Dashboard",
  cms: "CMS",
};

function groupByCategory<T, K extends string>(items: T[], key: (t: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const it of items) {
    const k = key(it);
    (out[k] ||= []).push(it);
  }
  return out;
}

export function buildSections(): NavSection[] {
  const websiteTemplates = layouts.filter((l) => l.category === "website-template");
  const otherLayouts = layouts.filter((l) => l.category !== "website-template");
  const layoutsByCat = groupByCategory(
    otherLayouts,
    (l) => l.category as Exclude<LayoutEntry["category"], "website-template">,
  );
  const slicesByCat = groupByCategory(slices, (s) => s.category as string);
  const SLICE_CATEGORY_ORDER = ["auth", "payment", "ai", "email", "data", "search", "realtime", "content", "storage", "ui", "os", "infra"];

  // 5-cluster IA (2026-05-30): onboarding → the three catalogs → standards →
  // automation → releases. Replaces the 10-leaf "Get Started" dumping ground
  // and surfaces Best Practice / Audit Chain (previously sidebar-invisible).
  return [
    {
      label: "Get Started",
      items: [
        { kind: "leaf", title: "Introduction", href: "/docs" },
        { kind: "leaf", title: "Installation", href: "/installation" },
        { kind: "leaf", title: "Architecture", href: "/architecture" },
        { kind: "leaf", title: "Stack", href: "/stack" },
        { kind: "leaf", title: "Directory", href: "/directory" },
      ],
    },
    {
      label: "Slices",
      items: [
        { kind: "leaf", title: "All slices", href: "/slices" },
        ...SLICE_CATEGORY_ORDER.filter((cat) => slicesByCat[cat]?.length).map(
          (cat): NavBranch => ({
            kind: "branch",
            title: cat === "os" ? "OS Apps" : cat.charAt(0).toUpperCase() + cat.slice(1),
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
      label: "Website Templates",
      items: [
        { kind: "leaf", title: "All website templates", href: "/templates" },
        ...websiteTemplates.map(
          (l): NavLeaf => ({ kind: "leaf", title: l.title, href: `/layouts/${l.slug}` }),
        ),
      ],
    },
    {
      label: "Standards",
      items: [
        { kind: "leaf", title: "Best Practice", href: "/best-practice" },
        { kind: "leaf", title: "Audit Chain", href: "/audit-chain" },
      ],
    },
    {
      label: "Automation",
      items: [
        { kind: "leaf", title: "Install with Agent", href: "/agents", badge: "new" },
        { kind: "leaf", title: "Bundle Builder", href: "/build" },
        { kind: "leaf", title: "MCP server", href: "/mcp", badge: "new" },
        { kind: "leaf", title: "VPS Control Room", href: "/control-room", badge: "new" },
      ],
    },
    {
      label: "Releases",
      items: [{ kind: "leaf", title: "Changelog", href: "/changelog" }],
    },
  ];
}
