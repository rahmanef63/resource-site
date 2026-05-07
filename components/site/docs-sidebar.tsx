"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { layouts } from "@/lib/content/layouts";
import { recipes } from "@/lib/content/recipes";
import { features } from "@/lib/content/features";
import { cn } from "@/lib/utils";

type NavItem = { title: string; href: string; badge?: string; disabled?: boolean };
type NavSection = { label: string; items: NavItem[] };

const STATIC: NavSection[] = [
  {
    label: "Get Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/installation" },
      { title: "Architecture", href: "/architecture" },
      { title: "Stack", href: "/stack" },
      { title: "Directory", href: "/directory" },
      { title: "Install with Agent", href: "/agents", badge: "new" },
      { title: "Bundle Builder", href: "/build", badge: "new" },
      { title: "MCP server", href: "/mcp", badge: "new" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const websiteTemplates = layouts.filter((l) => l.category === "website-template");
  const otherLayouts = layouts.filter((l) => l.category !== "website-template");

  const sections: NavSection[] = [
    ...STATIC,
    {
      label: "Website Templates",
      items: [
        { title: "All website templates", href: "/templates", badge: "new" },
        ...websiteTemplates.map((l) => ({ title: l.title, href: `/layouts/${l.slug}` })),
      ],
    },
    {
      label: "Layouts",
      items: [
        { title: "All layouts", href: "/layouts" },
        ...otherLayouts.map((l) => ({ title: l.title, href: `/layouts/${l.slug}` })),
      ],
    },
    {
      label: "Recipes",
      items: [
        { title: "All recipes", href: "/recipes" },
        ...recipes.map((r) => ({ title: r.title, href: `/recipes/${r.slug}` })),
      ],
    },
    {
      label: "Features",
      items: [
        { title: "All features", href: "/features", badge: "new" },
        ...features.map((f) => ({ title: f.title, href: `/features/${f.slug}` })),
      ],
    },
  ];

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {sections.map((section) => (
        <div key={section.label}>
          <h4 className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {section.label}
          </h4>
          <ul className="flex flex-col">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.disabled ? "#" : item.href}
                    aria-disabled={item.disabled}
                    className={cn(
                      "group flex h-7 items-center gap-2 rounded-md px-2 text-[13px] transition-colors",
                      item.disabled
                        ? "pointer-events-none opacity-50"
                        : active
                          ? "bg-blue-500/15 font-medium text-blue-700 dark:text-blue-300"
                          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                    )}
                  >
                    <span className="flex-1 truncate">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
