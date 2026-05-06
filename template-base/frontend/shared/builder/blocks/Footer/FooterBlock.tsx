"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export interface FooterColumn {
  heading: string
  links: { label: string; href?: string }[]
}

export interface FooterBlockProps {
  logoText?: string
  tagline?: string
  columns?: FooterColumn[]
  copyright?: string
  className?: string
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
]

export function FooterBlock({
  logoText = "Brand",
  tagline = "Building better products together.",
  columns = DEFAULT_COLUMNS,
  copyright,
  className,
}: FooterBlockProps) {
  const year = new Date().getFullYear()

  return (
    <footer className={cn("w-full bg-muted/40 border-t", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_repeat(3,auto)] gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <span className="font-bold text-lg text-primary">{logoText}</span>
            <p className="text-sm text-muted-foreground leading-relaxed">{tagline}</p>
          </div>

          {/* Link columns */}
          {columns.map((col, i) => (
            <div key={i} className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold">{col.heading}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href ?? "#"}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground text-center">
          {copyright ?? `© ${year} ${logoText}. All rights reserved.`}
        </p>
      </div>
    </footer>
  )
}
