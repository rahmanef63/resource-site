"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { AdminNavItem, Brand, User } from "../types/common";

type SidebarProps = {
  brand: Pick<Brand, "brandLetter" | "brandName">;
  appLabel: string; // e.g. "Personal Brand OS", "Agency Studio OS"
  homeHref: string;
  primaryNav: AdminNavItem[];
  settingsNav?: AdminNavItem[];
  user: User;
};

function NavBody({ primaryNav, settingsNav, onItemClick }: Pick<SidebarProps, "primaryNav" | "settingsNav"> & { onItemClick?: () => void }) {
  const pathname = usePathname() ?? "";
  const isActive = (href: string, isHome: boolean) =>
    isHome ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const renderItem = (n: AdminNavItem, idx: number, isHome: boolean) => {
    const Icon = n.icon;
    const on = isActive(n.href, isHome);
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
        {Icon && <Icon className="size-4" />}
        <span className="flex-1 truncate">{n.label}</span>
        {n.count != null && n.count > 0 && (
          <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
            {n.count}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <div className="px-2 py-3">
      <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</p>
      <nav className="flex flex-col gap-0.5">
        {primaryNav.map((n, i) => renderItem(n, i, i === 0))}
      </nav>

      {settingsNav && settingsNav.length > 0 && (
        <>
          <p className="mt-5 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Settings
          </p>
          <nav className="flex flex-col gap-0.5">
            {settingsNav.map((n) => renderItem(n, 0, false))}
          </nav>
        </>
      )}
    </div>
  );
}

function BrandHeader({ brand, appLabel, homeHref }: Pick<SidebarProps, "brand" | "appLabel" | "homeHref">) {
  return (
    <Link href={homeHref} className="flex items-center gap-2 px-4 py-4">
      <div className="grid size-8 place-items-center rounded-md bg-foreground text-background">{brand.brandLetter}</div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{brand.brandName}</p>
        <p className="truncate text-[11px] text-muted-foreground">{appLabel}</p>
      </div>
    </Link>
  );
}

function UserFooter({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="grid size-8 place-items-center rounded-full bg-muted text-xs">{user.initials}</div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{user.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
      </div>
      <ChevronDown className="ml-auto size-3.5 text-muted-foreground" />
    </div>
  );
}

export function AdminSidebar(props: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 md:flex">
      <BrandHeader brand={props.brand} appLabel={props.appLabel} homeHref={props.homeHref} />
      <Separator />
      <div className="flex-1 overflow-auto">
        <NavBody primaryNav={props.primaryNav} settingsNav={props.settingsNav} />
      </div>
      <Separator />
      <UserFooter user={props.user} />
    </aside>
  );
}

export function AdminSidebarMobileTrigger(props: SidebarProps) {
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
          <BrandHeader brand={props.brand} appLabel={props.appLabel} homeHref={props.homeHref} />
        </SheetHeader>
        <Separator />
        <div className="flex-1 overflow-auto">
          <NavBody primaryNav={props.primaryNav} settingsNav={props.settingsNav} onItemClick={() => setOpen(false)} />
        </div>
        <Separator />
        <UserFooter user={props.user} />
      </SheetContent>
    </Sheet>
  );
}
