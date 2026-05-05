"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, Box, ChefHat, FileCode, Layout, LogOut, Settings, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", href: "/admin", icon: Sparkles },
  { label: "Site", href: "/admin/site", icon: Settings },
  { label: "Layouts", href: "/admin/layouts", icon: Layout },
  { label: "Recipes", href: "/admin/recipes", icon: ChefHat },
  { label: "Sources", href: "/admin/sources", icon: Box },
  { label: "Export", href: "/admin/export", icon: FileCode },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin-login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-8 px-4 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 border-r border-border/60 md:block">
        <div className="sticky top-14 py-6 pl-4 pr-2 lg:pl-6">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </p>
          <nav className="mt-3 flex flex-col gap-0.5">
            {NAV.map((item) => {
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
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" /> {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-md border bg-card/40 p-3">
            <p className="truncate text-[11px] font-medium text-foreground">{email}</p>
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
              Local-only editor. Edits live in your browser. Use{" "}
              <Link href="/admin/export" className="underline">Export</Link> to commit.
            </AlertDescription>
          </Alert>
        </div>
      </aside>
      <div className="min-w-0 flex-1 py-8">{children}</div>
    </div>
  );
}
