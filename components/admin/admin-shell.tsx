"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  AlertTriangle,
  Box,
  FileCode,
  GaugeCircle,
  GitBranch,
  Layout,
  LayoutGrid,
  LogOut,
  Network,
  PackageSearch,
  Settings,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const EDIT_NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: Sparkles },
  { label: "Site", href: "/admin/site", icon: Settings },
  { label: "Layouts", href: "/admin/layouts", icon: Layout },
  { label: "Sources", href: "/admin/sources", icon: Box },
  { label: "Export", href: "/admin/export", icon: FileCode },
];

const INSPECT_NAV: NavItem[] = [
  { label: "Lineage", href: "/admin/lineage", icon: GitBranch },
  { label: "Quality", href: "/admin/quality", icon: GaugeCircle },
  { label: "Registry", href: "/admin/registry", icon: PackageSearch },
];

function NavSection({
  label,
  items,
  pathname,
  icon: SectionIcon,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <SectionIcon className="size-3" />
        {label}
      </div>
      <nav className="mt-1.5 flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors",
                active
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" /> {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin-login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] gap-8 px-4 sm:px-6 lg:px-8">
      <aside className="hidden w-60 shrink-0 border-r border-border/60 md:block">
        <div className="sticky top-14 py-6 pl-4 pr-3 lg:pl-6">
          <div className="flex items-center gap-2 px-2">
            <div className="flex size-7 items-center justify-center rounded-md border bg-card">
              <LayoutGrid className="size-3.5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Operator</p>
              <p className="text-[10px] text-muted-foreground">
                rr control room
              </p>
            </div>
          </div>

          <NavSection
            label="Edit"
            items={EDIT_NAV}
            pathname={pathname}
            icon={FileCode}
          />
          <NavSection
            label="Inspect"
            items={INSPECT_NAV}
            pathname={pathname}
            icon={Network}
          />

          <div className="mt-6 rounded-md border bg-card/40 p-3">
            <p className="truncate text-[11px] font-medium text-foreground">
              {email}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-7 gap-1.5 px-2 text-[11px]"
              onClick={logout}
            >
              <LogOut className="size-3" /> Sign out
            </Button>
          </div>

          <Alert className="mt-4 border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="size-3.5 text-amber-500" />
            <AlertDescription className="text-[11px] leading-relaxed">
              Local edits live in your browser.{" "}
              <Link href="/admin/export" className="underline">
                Export
              </Link>{" "}
              to commit. Inspect tabs are read-only.
            </AlertDescription>
          </Alert>
        </div>
      </aside>
      <div className="min-w-0 flex-1 py-8">{children}</div>
    </div>
  );
}
