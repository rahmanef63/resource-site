"use client"

import React from "react"
import Link from "next/link"
import { Menu, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { BRAND_NAME, BrandLockup } from "@/components/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { cn } from "@/lib/utils"

export const MARKETING_NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
] as const

export function isMarketingHeaderRoute(pathname: string) {
  if (!pathname) return false
  if (pathname === "/") return true

  return MARKETING_NAV_LINKS.some(({ href }) => (
    pathname === href || pathname.startsWith(`${href}/`)
  ))
}

export function MarketingDesktopHeaderNav({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-4", className)}>
      <Link href="/" className="shrink-0 text-foreground">
        <BrandLockup
          label={BRAND_NAME}
          logoClassName="size-5"
          labelClassName="text-lg font-bold"
        />
      </Link>

      <nav className="hidden min-w-0 items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
        {MARKETING_NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export function MarketingThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <ThemeIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MarketingMobileMenuButton({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button variant="ghost" size="icon" className={className} onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open marketing menu</span>
      </Button>

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="panel" sheetSide="right" contentClassName="sm:max-w-[350px]">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>
            <BrandLockup
              label={BRAND_NAME}
              logoClassName="size-6"
              labelClassName="text-xl font-bold"
            />
          </ResponsiveDialog.Title>
          <ResponsiveDialog.Description className="sr-only">Marketing navigation and authentication links</ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <nav className="flex flex-col gap-2">
            {MARKETING_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 -mx-2 text-lg font-medium transition-colors hover:bg-muted hover:text-primary"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-6 border-t" />

            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild className="h-10 w-full justify-start">
                <Link href="/sign-in" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild className="h-10 w-full justify-start">
                <Link href="/sign-up" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </Button>
            </div>
          </nav>
        </ResponsiveDialog.Body>
      </ResponsiveDialog>
    </>
  )
}

export function GuestMarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4">
        <MarketingDesktopHeaderNav />

        <div className="flex items-center gap-2">
          <MarketingThemeToggle className="h-9 w-9" />

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>

          <MarketingMobileMenuButton className="h-9 w-9 md:hidden" />
        </div>
      </div>
    </header>
  )
}
