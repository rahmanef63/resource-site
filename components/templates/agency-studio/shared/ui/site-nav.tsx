"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_SITE_CONFIG } from "../site-config";

export const PUBLIC_BASE = "/preview/agency-studio-os/public";

export const PUBLIC_NAV = [
  { label: "Services", href: `${PUBLIC_BASE}/services` },
  { label: "Work", href: `${PUBLIC_BASE}/portfolio` },
  { label: "About", href: `${PUBLIC_BASE}/about` },
  { label: "Contact", href: `${PUBLIC_BASE}/contact` },
];

export function SiteNav() {
  const c = DEFAULT_SITE_CONFIG;
  const pathname = usePathname() ?? "";
  const [open, setOpen] = React.useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href={PUBLIC_BASE} className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-foreground text-background">{c.brandLetter}</span>
          <span>{c.brandName}</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {PUBLIC_NAV.map((n) => {
            const on = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-md px-3 py-1.5 transition",
                  on ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <Button asChild size="sm">
            <Link href={c.bookCallHref}>
              Start a project <ArrowRight className="size-3.5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="size-9 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {PUBLIC_NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
