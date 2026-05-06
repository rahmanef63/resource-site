"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SmartLink } from "@/frontend/shared/ui/components/SmartLink"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface PricingCardBlockProps {
  name?: string
  price?: string
  period?: string
  description?: string
  features?: string[]
  ctaLabel?: string
  ctaHref?: string
  highlighted?: boolean
  badge?: string
  className?: string
}

export function PricingCardBlock({
  name = "Pro",
  price = "$49",
  period = "/month",
  description = "Everything you need to grow.",
  features = ["Unlimited pages", "All blocks", "Priority support", "Custom domain"],
  ctaLabel = "Get started",
  ctaHref = "#",
  highlighted = false,
  badge,
  className,
}: PricingCardBlockProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-8 gap-6",
        highlighted
          ? "border-primary bg-primary text-primary-foreground shadow-xl scale-[1.02]"
          : "bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {badge && (
        <Badge
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 px-4",
            highlighted ? "bg-background text-foreground" : "bg-primary text-primary-foreground"
          )}
        >
          {badge}
        </Badge>
      )}

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-bold">{price}</span>
          <span className={cn("text-sm mb-1", highlighted ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {period}
          </span>
        </div>
        <p className={cn("text-sm", highlighted ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {description}
        </p>
      </div>

      <ul className="flex flex-col gap-2.5 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check
              size={16}
              className={cn("shrink-0", highlighted ? "text-primary-foreground" : "text-primary")}
            />
            {f}
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant={highlighted ? "secondary" : "default"}
        className="w-full mt-auto"
      >
        <SmartLink href={ctaHref ?? "#"}>{ctaLabel}</SmartLink>
      </Button>
    </div>
  )
}
