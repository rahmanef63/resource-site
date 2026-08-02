"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SmartLink } from "@/frontend/shared/ui/components/SmartLink"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

export interface NavbarLink {
  label: string
  href?: string
}

export interface NavbarBlockProps {
  logo?: string
  logoText?: string
  links?: NavbarLink[]
  ctaLabel?: string
  ctaHref?: string
  sticky?: boolean
  className?: string
}

export function NavbarBlock({
  logo,
  logoText = "Brand",
  links = [
    { label: "Product", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "About", href: "#" },
  ],
  ctaLabel = "Get Started",
  ctaHref = "#",
  sticky = false,
  className,
}: NavbarBlockProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <nav
      className={cn(
        "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        sticky && "sticky top-0 z-50",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-lg">
            {logo ? (
              <Image
                src={logo}
                alt={logoText}
                width={128}
                height={32}
                className="h-8 w-auto"
                // User-configured URLs — bypass Next's optimizer so we don't
                // need to pre-register every possible CDN host.
                unoptimized
              />
            ) : (
              <span className="text-primary">{logoText}</span>
            )}
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link, i) => (
              <SmartLink
                key={i}
                href={link.href ?? "#"}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </SmartLink>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            {ctaLabel && (
              <Button size="sm" asChild className="hidden md:inline-flex">
                <SmartLink href={ctaHref ?? "#"}>{ctaLabel}</SmartLink>
              </Button>
            )}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t py-3 flex flex-col gap-2">
            {links.map((link, i) => (
              <SmartLink
                key={i}
                href={link.href ?? "#"}
                className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                {link.label}
              </SmartLink>
            ))}
            {ctaLabel && (
              <Button size="sm" className="mt-2 w-full" asChild>
                <SmartLink href={ctaHref ?? "#"}>{ctaLabel}</SmartLink>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
