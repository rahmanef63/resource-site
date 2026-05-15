"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { CommandPalette } from "./command-palette";
import { ThemePresetSwitcher } from "./theme-preset-switcher";
import { site } from "@/lib/content/site";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Docs", href: "/docs" },
  { label: "Layouts", href: "/layouts" },
  { label: "Slices", href: "/slices" },
  { label: "Compiler", href: "/compiler" },
  { label: "Quality", href: "/quality" },
  { label: "Directory", href: "/directory" },
  { label: "Agents", href: "/agents" },
  { label: "Install", href: "/installation" },
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

export function TopNavbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-foreground" aria-label={site.name}>
            <BrandMark />
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              {site.shortName ?? site.name}
            </span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    active ? "text-foreground" : "text-muted-foreground"
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="border-b px-4 py-4">
                <Link href="/" className="flex items-center gap-2">
                  <BrandMark />
                  <span className="font-semibold">{site.name}</span>
                </Link>
              </div>
              <nav className="flex flex-col gap-1 p-2">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
