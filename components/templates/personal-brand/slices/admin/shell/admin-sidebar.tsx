"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  Briefcase,
  ChevronDown,
  FileText,
  Inbox,
  LayoutDashboard,
  LineChart,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useStore } from "../../../shared/store";
import { DEFAULT_SITE_CONFIG } from "../../../shared/site-config";

export const ADMIN_BASE = "/preview/personal-brand-os/admin";

function useNavItems() {
  const { state } = useStore();
  const draftCount = state.posts.filter((p) => p.status !== "published").length;
  const pendingComments = state.comments.filter((c) => c.status === "pending").length;
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const flaggedChats = state.chatSessions.filter((s) => s.flagged).length;
  const pendingSubs = state.subscribers.filter((s) => s.status === "pending").length;

  const NAV = [
    { id: "dashboard", label: "Dashboard", href: ADMIN_BASE,                 icon: LayoutDashboard, count: null as number | null },
    { id: "posts",     label: "Posts",     href: `${ADMIN_BASE}/posts`,      icon: FileText,        count: draftCount || null },
    { id: "portfolio", label: "Portfolio", href: `${ADMIN_BASE}/portfolio`,  icon: Briefcase,       count: state.portfolio.length },
    { id: "services",  label: "Services",  href: `${ADMIN_BASE}/services`,   icon: Sparkles,        count: state.services.length },
    { id: "resources", label: "Resources", href: `${ADMIN_BASE}/resources`,  icon: BookOpen,        count: state.resources.length },
    { id: "leads",     label: "Leads",     href: `${ADMIN_BASE}/leads`,      icon: Inbox,           count: newLeads || null },
    { id: "newsletter",label: "Newsletter",href: `${ADMIN_BASE}/newsletter`, icon: Mail,            count: pendingSubs || null },
    { id: "comments",  label: "Comments",  href: `${ADMIN_BASE}/comments`,   icon: MessageSquare,   count: pendingComments || null },
    { id: "chatbot",   label: "Chatbot",   href: `${ADMIN_BASE}/chatbot`,    icon: Bot,             count: flaggedChats || null },
    { id: "analytics", label: "Analytics", href: `${ADMIN_BASE}/analytics`,  icon: LineChart,       count: null },
  ];

  const SETTINGS_NAV = [
    { id: "ai",   label: "AI Config", href: `${ADMIN_BASE}/settings/ai`,   icon: Wand2 },
    { id: "team", label: "Team",      href: `${ADMIN_BASE}/settings/team`, icon: Users },
    { id: "site", label: "Site",      href: `${ADMIN_BASE}/settings/site`, icon: Settings },
  ];

  return { NAV, SETTINGS_NAV };
}

function NavBody({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname() ?? "";
  const { NAV, SETTINGS_NAV } = useNavItems();
  const isActive = (href: string) =>
    href === ADMIN_BASE ? pathname === ADMIN_BASE : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <div className="px-2 py-3">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</p>
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
                  <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
                    {n.count}
                  </Badge>
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
    </>
  );
}

function BrandHeader() {
  const c = DEFAULT_SITE_CONFIG;
  return (
    <Link href={ADMIN_BASE} className="flex items-center gap-2 px-4 py-4">
      <div className="grid size-8 place-items-center rounded-md bg-foreground text-background">{c.brandLetter}</div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{c.brandName}</p>
        <p className="truncate text-[11px] text-muted-foreground">Personal Brand OS</p>
      </div>
    </Link>
  );
}

function UserFooter() {
  const c = DEFAULT_SITE_CONFIG;
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="grid size-8 place-items-center rounded-full bg-muted text-xs">{c.ownerInitials}</div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{c.ownerName}</p>
        <p className="truncate text-[10px] text-muted-foreground">{c.ownerRole}</p>
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

/** Mobile drawer trigger (rendered inside topbar). */
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
