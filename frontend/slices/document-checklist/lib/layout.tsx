"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Minimal page container — width-capped, gutter-padded. Stand-in for the
 * CareerPack `PageContainer` since the kitab has no shared equivalent.
 */
export function PageContainer({
  children,
  className,
  size = "lg",
}: {
  children: ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const maxWidth = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
  }[size]
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8",
        maxWidth,
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Minimal page header — title + optional description. Stand-in for the
 * CareerPack `ResponsivePageHeader`.
 */
export function PageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </header>
  )
}
