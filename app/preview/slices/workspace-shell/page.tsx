"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset,
  SidebarProvider, SidebarRail, SidebarTrigger,
} from "@/components/ui/sidebar";
import { WORKSPACES, USER, forkOf } from "./data";
import { NavMain, NavUser, WorkspaceSwitcher } from "./nav";

/** workspace-shell preview — a clean sidebar-07 dashboard whose team switcher
 *  IS the atomic NavContext: pick a workspace and its whole menuSet flips with
 *  it; fork clones that menuSet into a personal copy you own. */
export default function Page() {
  const [wsId, setWsId] = React.useState(WORKSPACES[0].id);
  const [forked, setForked] = React.useState(false);
  const ws = WORKSPACES.find((w) => w.id === wsId)!;
  const nav = forked ? forkOf(ws) : ws.nav;

  // Switching workspace resets to its default menuSet (resolver: user fork →
  // workspace default).
  const pick = (id: string) => { setWsId(id); setForked(false); };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <WorkspaceSwitcher
            active={ws}
            onPick={pick}
            forked={forked}
            onToggleFork={() => setForked((f) => !f)}
          />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={nav} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={USER} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">{ws.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{nav[0]?.title ?? "Dashboard"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Badge variant={forked ? "default" : "secondary"} className="ml-auto text-[10px]">
            {forked ? "menuSet · your fork" : "menuSet · workspace default"}
          </Badge>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[40vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
