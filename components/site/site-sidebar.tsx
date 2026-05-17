"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  BookOpen,
  Rocket,
  Layout,
  Sparkles,
  GitBranch,
  Globe,
  Home,
  Wand2,
} from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { layouts } from "@/lib/content/layouts";
import { slices } from "@/lib/content/slices";
import { site } from "@/lib/content/site";
import { SidebarListGroup } from "@/components/site/site-sidebar/sidebar-list-group";

const docsItems = [
  { title: "Introduction", href: "/", icon: Home },
  { title: "Installation", href: "/installation", icon: Rocket },
  { title: "Architecture", href: "/architecture", icon: Layers },
  { title: "Stack", href: "/stack", icon: GitBranch },
];

export function SiteSidebar() {
  const pathname = usePathname() ?? "";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const websiteTemplates = layouts.filter((l) => l.category === "website-template");
  const otherLayouts = layouts.filter((l) => l.category !== "website-template");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{site.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {site.shortName}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Docs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {docsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarListGroup
          label="Website templates"
          icon={Globe}
          allLabel="All website templates"
          allHref="/templates"
          pathname={pathname}
          items={websiteTemplates}
          itemHrefPrefix="/layouts"
        />

        <SidebarListGroup
          label="Layouts"
          icon={Layout}
          allLabel="All layouts"
          allHref="/layouts"
          pathname={pathname}
          items={otherLayouts}
          itemHrefPrefix="/layouts"
        />

        {/* Recipes group removed 2026-05-12 — migrated to slices (Phase 3 of REFACTOR-PLAN.md). */}

        <SidebarListGroup
          label="Slices"
          icon={Wand2}
          allLabel="All slices"
          allHref="/slices"
          pathname={pathname}
          items={slices}
          itemHrefPrefix="/slices"
        />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={site.repo} target="_blank" rel="noopener noreferrer">
                <Github className="size-4" />
                <span>GitHub</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/llms.txt" target="_blank" rel="noopener noreferrer">
                <BookOpen className="size-4" />
                <span>llms.txt</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
