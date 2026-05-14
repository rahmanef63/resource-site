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

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Globe className="size-3.5" /> Website templates
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/templates"}>
                  <Link href="/templates">
                    <span className="font-semibold">All website templates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {layouts
                .filter((l) => l.category === "website-template")
                .map((l) => (
                  <SidebarMenuItem key={l.slug}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/layouts/${l.slug}`}
                      size="sm"
                    >
                      <Link href={`/layouts/${l.slug}`}>
                        <span className="truncate text-xs text-muted-foreground/80 group-data-[active=true]/menu-button:text-foreground">{l.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Layout className="size-3.5" /> Layouts
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/layouts"}>
                  <Link href="/layouts">
                    <span className="font-semibold">All layouts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {layouts
                .filter((l) => l.category !== "website-template")
                .map((l) => (
                  <SidebarMenuItem key={l.slug}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/layouts/${l.slug}`}
                      size="sm"
                    >
                      <Link href={`/layouts/${l.slug}`}>
                        <span className="truncate text-xs text-muted-foreground/80 group-data-[active=true]/menu-button:text-foreground">{l.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recipes group removed 2026-05-12 — migrated to slices (Phase 3 of REFACTOR-PLAN.md). */}

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Wand2 className="size-3.5" /> Slices
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/slices"}>
                  <Link href="/slices">
                    <span className="font-semibold">All slices</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {slices.map((s) => (
                <SidebarMenuItem key={s.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/slices/${s.slug}`}
                    size="sm"
                  >
                    <Link href={`/slices/${s.slug}`}>
                      <span className="truncate text-xs text-muted-foreground/80 group-data-[active=true]/menu-button:text-foreground">{s.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
