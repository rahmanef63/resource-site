import { query } from "../../_generated/server";

const COUNT_TABLES = [
  "contactSubmissions",
  "blogPosts",
  "portfolioItems",
  "services",
  "testimonials",
  "aboutPillars",
  "aiFeatures",
  "aiIntegrationTiles",
  "upcomingProjects",
  "experiments",
  "navItems",
] as const;

type CountTable = (typeof COUNT_TABLES)[number];

const ACTIVITY_SPEC: {
  table: CountTable;
  kind: string;
  label: string;
  href: string;
  title: (row: any) => string;
}[] = [
  {
    table: "contactSubmissions",
    kind: "message",
    label: "Message",
    href: "/admin/messages",
    title: (r) => r.name ?? r.email ?? "New message",
  },
  {
    table: "blogPosts",
    kind: "blog",
    label: "Blog",
    href: "/admin/blog",
    title: (r) => r.title ?? "Untitled post",
  },
  {
    table: "portfolioItems",
    kind: "portfolio",
    label: "Portfolio",
    href: "/admin/portfolio",
    title: (r) => r.title ?? "Portfolio item",
  },
  {
    table: "services",
    kind: "service",
    label: "Service",
    href: "/admin/services",
    title: (r) => r.title ?? "Service",
  },
  {
    table: "testimonials",
    kind: "testimonial",
    label: "Testimonial",
    href: "/admin/testimonials",
    title: (r) => r.author ?? r.name ?? "Testimonial",
  },
  {
    table: "aboutPillars",
    kind: "about",
    label: "About",
    href: "/admin/about",
    title: (r) => r.title ?? "About pillar",
  },
  {
    table: "aiFeatures",
    kind: "ai",
    label: "AI",
    href: "/admin/ai-content",
    title: (r) => r.title ?? "AI feature",
  },
  {
    table: "aiIntegrationTiles",
    kind: "ai",
    label: "AI",
    href: "/admin/ai-content",
    title: (r) => r.title ?? "AI tile",
  },
  {
    table: "upcomingProjects",
    kind: "project",
    label: "Project",
    href: "/admin/projects",
    title: (r) => r.title ?? "Project",
  },
  {
    table: "experiments",
    kind: "playground",
    label: "Playground",
    href: "/admin/playground",
    title: (r) => r.title ?? "Experiment",
  },
  {
    table: "navItems",
    kind: "nav",
    label: "Nav",
    href: "/admin/navigation",
    title: (r) => r.label ?? r.href ?? "Nav item",
  },
];

// Admin stats are unbounded scans across dynamic tables (can't .withIndex on
// a runtime-named table). Cap each scan so a growing table doesn't blow the
// query budget — UI shows "N+" when the cap is hit.
const STATS_TABLE_CAP = 1000;
const ACTIVITY_TABLE_CAP = 200;

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const counts: Record<string, number | string> = {};
    for (const table of COUNT_TABLES) {
      const rows = await ctx.db.query(table).take(STATS_TABLE_CAP + 1);
      counts[table] = rows.length > STATS_TABLE_CAP ? `${STATS_TABLE_CAP}+` : rows.length;
    }

    let unreadMessages: number | string = 0;
    try {
      const msgs = await ctx.db.query("contactSubmissions").take(STATS_TABLE_CAP + 1);
      const unread = msgs.filter((m: any) => !m.isRead).length;
      unreadMessages = msgs.length > STATS_TABLE_CAP ? `${unread}+` : unread;
    } catch {
      unreadMessages = 0;
    }

    const merged: {
      id: string;
      kind: string;
      label: string;
      href: string;
      title: string;
      createdAt: number;
    }[] = [];

    for (const spec of ACTIVITY_SPEC) {
      const rows = await ctx.db.query(spec.table).take(ACTIVITY_TABLE_CAP);
      for (const row of rows as any[]) {
        merged.push({
          id: row._id,
          kind: spec.kind,
          label: spec.label,
          href: spec.href,
          title: spec.title(row),
          createdAt: row.createdAt ?? row._creationTime ?? 0,
        });
      }
    }

    merged.sort((a, b) => b.createdAt - a.createdAt);
    const activity = merged.slice(0, 12);

    return { counts, unreadMessages, activity };
  },
});
