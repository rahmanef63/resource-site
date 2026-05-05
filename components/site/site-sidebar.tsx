"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  PackagePlus,
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
import { recipes } from "@/lib/content/recipes";
import { features } from "@/lib/content/features";
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
                    <span className="font-medium">All website templates</span>
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
                        <span className="truncate text-sm">{l.title}</span>
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
                    <span className="font-medium">All layouts</span>
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
                        <span className="truncate text-sm">{l.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <PackagePlus className="size-3.5" /> Recipes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/recipes"}>
                  <Link href="/recipes">
                    <span className="font-medium">All recipes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {recipes.map((r) => (
                <SidebarMenuItem key={r.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/recipes/${r.slug}`}
                    size="sm"
                  >
                    <Link href={`/recipes/${r.slug}`}>
                      <span className="truncate text-sm">{r.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Wand2 className="size-3.5" /> Features
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/features"}>
                  <Link href="/features">
                    <span className="font-medium">All features</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {features.map((f) => (
                <SidebarMenuItem key={f.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/features/${f.slug}`}
                    size="sm"
                  >
                    <Link href={`/features/${f.slug}`}>
                      <span className="truncate text-sm">{f.title}</span>
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
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer">
                <BookOpen className="size-4" />
                <span>llms.txt</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
