"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { BookOpen, Bot, Boxes, Compass, Download, Menu, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileMenuDrawer, type NavGroup } from "@/features/dashboard-shell";
import { CommandPalette } from "./command-palette";
import { ThemePresetSwitcher } from "./theme-preset-switcher";
import { site } from "@/lib/content/site";
import { cn } from "@/lib/utils";

// Top-nav mirrors the sidebar's 5-cluster IA (2026-05-30): one label per
// destination, "Slices" everywhere (URL + sidebar + code agree — dropped the
// "Modules" relabel that split the taxonomy three ways). Directory lives under
// the Get Started sidebar cluster; the navbar keeps the curated quick-links.
const NAV = [
  { label: "Docs", href: "/docs", icon: BookOpen },
  { label: "Tour", href: "/tour", icon: Compass },
  { label: "Slices", href: "/slices", icon: Boxes },
  { label: "Best Practice", href: "/best-practice", icon: ShieldCheck },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Install", href: "/installation", icon: Download },
];

// Mobile nav is the same thumbnail drawer the dashboard-shell slice ships —
// the site never shows a sheet-shaped link list on a phone.
const MOBILE_NAV: NavGroup[] = [
  { id: "site", items: NAV.map((i) => ({ id: i.href, label: i.label, href: i.href, icon: i.icon })) },
];

function BrandMark({ className }: { className?: string }) {
  return (
    <>
      {/* white mark on dark theme */}
      <Image
        src="/brand-assets/logo-mark-fill-white.svg"
        alt=""
        aria-hidden
        width={24}
        height={24}
        className={cn("hidden size-6 dark:block", className)}
      />
      {/* black mark on light theme */}
      <Image
        src="/brand-assets/logo-mark-fill-black.svg"
        alt=""
        aria-hidden
        width={24}
        height={24}
        className={cn("size-6 dark:hidden", className)}
      />
    </>
  );
}

/** Dim chrome when user lands on a template/layout DETAIL page so the
 *  iframe preview reads as the primary content. Matches:
 *    /layouts/<slug>   /templates/<slug>   /slices/<slug>
 *  but NOT the catalog index (/layouts, /templates, /slices). */
function useDetailDim(pathname: string | null): boolean {
  if (!pathname) return false;
  return /^\/(layouts|templates|slices)\/[^/]+/.test(pathname);
}

export function TopNavbar() {
  const pathname = usePathname();
  const dim = useDetailDim(pathname);
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        dim
          ? "border-border/30 bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30"
          : "border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      )}
    >
      <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group/brand flex items-center gap-2 text-foreground transition-opacity hover:opacity-100"
            aria-label={site.name}
          >
            <BrandMark />
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              {site.shortName ?? site.name}
            </span>
          </Link>
          <nav
            className={cn(
              // Subtle horizontal mask so far-right items fade — gives
              // the "you are deep in a template" feel on detail pages.
              // Nav + 256px search can't co-fit below ~1066px, so the link row
              // only appears at lg; md/tablet uses the hamburger sheet.
              "hidden items-center gap-5 text-sm font-medium lg:flex",
              dim &&
                "[mask-image:linear-gradient(to_right,transparent_0,black_24px,black_calc(100%-24px),transparent_100%)]",
            )}
          >
            {NAV.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative transition-colors duration-200 hover:text-foreground",
                    active
                      ? "text-foreground"
                      : dim
                        ? "text-muted-foreground/50 hover:text-foreground"
                        : "text-muted-foreground",
                    // Active underline pill — more interactive feedback.
                    active &&
                      "after:absolute after:-bottom-[18px] after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-foreground/80 after:content-['']",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <CommandPalette />
          </div>
          <Link
            href={site.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Github className="size-4" />
          </Link>
          <ThemePresetSwitcher />
          <Button asChild size="sm" className="hidden gap-1 sm:inline-flex">
            <Link href="/agents">
              <Plus className="size-3.5" />
              New
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <MobileMenuDrawer
            groups={MOBILE_NAV}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            pathname={pathname ?? "/"}
            title={site.name}
          />
        </div>
      </div>
    </header>
  );
}
