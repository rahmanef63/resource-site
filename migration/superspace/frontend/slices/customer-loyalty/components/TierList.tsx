"use client"

import { Crown, Inbox } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LoyaltyMember, LoyaltyTier } from "../types"

function formatPoints(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)
  } catch {
    return value.toLocaleString()
  }
}

interface TierListProps {
  items: LoyaltyTier[]
  members: LoyaltyMember[]
  onSelect: (row: LoyaltyTier) => void
  emptyAction?: React.ReactNode
}

export function TierList({ items, members, onSelect, emptyAction }: TierListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No tiers defined yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create tiers like Bronze, Silver, Gold to differentiate member benefits.
          </p>
        </div>
        {emptyAction}
      </div>
    )
  }

  // Sort by minPoints ascending so the hierarchy reads low → high.
  const sorted = [...items].sort((a, b) => a.minPoints - b.minPoints)

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((tier) => {
        const tierMemberCount = members.filter(
          (m) => m.tier.toLowerCase() === tier.name.toLowerCase(),
        ).length
        return (
          <Card
            key={tier._id}
            className="cursor-pointer transition hover:border-primary/40 hover:shadow-sm"
            onClick={() => onSelect(tier)}
          >
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-amber-50 p-2 text-amber-600 dark:bg-amber-950">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold capitalize">{tier.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      ≥ {formatPoints(tier.minPoints)} pts · ×{tier.pointsMultiplier}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    tier.isActive
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
                  )}
                >
                  {tier.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {tier.benefits && tier.benefits.length > 0 ? (
                <ul className="space-y-1 pl-5 text-xs text-muted-foreground [list-style:disc]">
                  {tier.benefits.slice(0, 4).map((b) => (
                    <li key={b} className="truncate">
                      {b}
                    </li>
                  ))}
                  {tier.benefits.length > 4 ? (
                    <li className="list-none text-[11px]">
                      +{tier.benefits.length - 4} more…
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  No benefits listed.
                </p>
              )}

              <div className="flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
                <span>{tierMemberCount} member{tierMemberCount === 1 ? "" : "s"}</span>
                <span>Click to view →</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
