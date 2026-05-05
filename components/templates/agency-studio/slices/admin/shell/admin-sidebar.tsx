"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ChevronDown,
  Inbox,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useStore } from "../../../shared/store";
import { DEFAULT_SITE_CONFIG } from "../../../shared/site-config";

export const ADMIN_BASE = "/preview/agency-studio-os/admin";

function useNavItems() {
  const { state } = useStore();
  const activeProjects = state.projects.filter((p) => p.status !== "delivered" && p.status !== "archived").length;
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const activeClients = state.clients.filter((c) => c.status === "active").length;

  const NAV = [
    { id: "dashboard", label: "Dashboard", href: ADMIN_BASE,                  icon: LayoutDashboard, count: null as number | null },
    { id: "projects",  label: "Projects",  href: `${ADMIN_BASE}/projects`,    icon: Briefcase,       count: activeProjects || null },
    { id: "clients",   label: "Clients",   href: `${ADMIN_BASE}/clients`,     icon: Users,           count: activeClients || null },
    { id: "services",  label: "Services",  href: `${ADMIN_BASE}/services`,    icon: Sparkles,        count: state.services.length },
    { id: "leads",     label: "Leads",     href: `${ADMIN_BASE}/leads`,       icon: Inbox,           count: newLeads || null },
  ];

  const SETTINGS_NAV = [
    { id: "studio", label: "Studio", href: `${ADMIN_BASE}/settings`, icon: Settings },
  ];

  return { NAV, SETTINGS_NAV };
}

function NavBody({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname() ?? "";
  const { NAV, SETTINGS_NAV } = useNavItems();
  const isActive = (href: string) =>
    href === ADMIN_BASE ? pathname === ADMIN_BASE : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="px-2 py-3">
      <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Studio</p>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((n) => {
          const Icon = n.icon;
          const on = isActive(n.href);
          return (
            <Link
              key={n.id}
              href={n.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition",
                on ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1 truncate">{n.label}</span>
              {n.count != null && n.count > 0 && (
                <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">{n.count}</Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <p className="mt-5 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Settings</p>
      <nav className="flex flex-col gap-0.5">
        {SETTINGS_NAV.map((n) => {
          const Icon = n.icon;
          const on = isActive(n.href);
          return (
            <Link
              key={n.id}
              href={n.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition",
                on ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function BrandHeader() {
  const c = DEFAULT_SITE_CONFIG;
  return (
    <Link href={ADMIN_BASE} className="flex items-center gap-2 px-4 py-4">
      <div className="grid size-8 place-items-center rounded-md bg-foreground text-background">{c.brandLetter}</div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{c.brandName}</p>
        <p className="truncate text-[11px] text-muted-foreground">Agency Studio OS</p>
      </div>
    </Link>
  );
}

function UserFooter() {
  const c = DEFAULT_SITE_CONFIG;
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="grid size-8 place-items-center rounded-full bg-muted text-xs">AR</div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">Asti R.</p>
        <p className="truncate text-[10px] text-muted-foreground">studio principal</p>
      </div>
      <ChevronDown className="ml-auto size-3.5 text-muted-foreground" />
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 md:flex">
      <BrandHeader />
      <Separator />
      <div className="flex-1 overflow-auto">
        <NavBody />
      </div>
      <Separator />
      <UserFooter />
    </aside>
  );
}

export function AdminSidebarMobileTrigger() {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 md:hidden" aria-label="Open menu">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col p-0">
        <SheetHeader className="px-0 pt-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <BrandHeader />
        </SheetHeader>
        <Separator />
        <div className="flex-1 overflow-auto">
          <NavBody onItemClick={() => setOpen(false)} />
        </div>
        <Separator />
        <UserFooter />
      </SheetContent>
    </Sheet>
  );
}
