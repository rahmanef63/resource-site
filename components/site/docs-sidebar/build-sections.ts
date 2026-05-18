import { layouts, type LayoutEntry } from "@/lib/content/layouts";
import { recipes } from "@/lib/content/recipes";
import { slices, type SliceEntry } from "@/lib/content/slices";
import type { NavBranch, NavLeaf, NavSection } from "./nav-types";

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

export function buildSections(): NavSection[] {
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
        { kind: "leaf", title: "Changelog", href: "/changelog", badge: "new" },
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
