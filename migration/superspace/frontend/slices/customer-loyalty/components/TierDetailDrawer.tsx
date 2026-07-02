"use client"

import { useState } from "react"
import { Crown, Pencil, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { UpsertTierDialog } from "./UpsertTierDialog"
import type { LoyaltyMember, LoyaltyTier, UpsertTierInput } from "../types"

function formatPoints(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)
  } catch {
    return value.toLocaleString()
  }
}

interface Props {
  tier: LoyaltyTier | null
  allTiers: LoyaltyTier[]
  members: LoyaltyMember[]
  onClose: () => void
  onUpsert: (input: UpsertTierInput) => Promise<unknown>
}

export function TierDetailDrawer({
  tier,
  allTiers,
  members,
  onClose,
  onUpsert,
}: Props) {
  const [editOpen, setEditOpen] = useState(false)

  if (!tier) return null

  // Determine the cap: the next-higher tier's minPoints (exclusive).
  const sorted = [...allTiers].sort((a, b) => a.minPoints - b.minPoints)
  const index = sorted.findIndex((t) => String(t._id) === String(tier._id))
  const nextTier = index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null
  const pointRangeLabel = nextTier
    ? `${formatPoints(tier.minPoints)} – ${formatPoints(nextTier.minPoints - 1)} pts`
    : `${formatPoints(tier.minPoints)} pts and above`

  const memberCount = members.filter(
    (m) => m.tier.toLowerCase() === tier.name.toLowerCase(),
  ).length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Loyalty tier</p>
          <h2 className="truncate text-lg font-semibold capitalize">{tier.name}</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            ≥ {formatPoints(tier.minPoints)} pts · ×{tier.pointsMultiplier}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 text-sm">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">Point cap range</dt>
          <dd className="col-span-2 font-mono text-xs">{pointRangeLabel}</dd>

          <dt className="text-muted-foreground">Multiplier</dt>
          <dd className="col-span-2">×{tier.pointsMultiplier}</dd>

          <dt className="text-muted-foreground">Members in tier</dt>
          <dd className="col-span-2">
            <div className="flex items-center gap-2">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-semibold">{memberCount}</span>
              <span className="text-xs text-muted-foreground">
                member{memberCount === 1 ? "" : "s"}
              </span>
            </div>
          </dd>
        </dl>

        <Separator className="my-4" />
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Benefits</p>
        {tier.benefits && tier.benefits.length > 0 ? (
          <ul className="mt-2 space-y-1 pl-5 text-sm [list-style:disc]">
            {tier.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs italic text-muted-foreground">No benefits listed.</p>
        )}

        <Separator className="my-4" />
        <p className="text-[11px] text-muted-foreground">
          Tiers are upserted by name. Changes apply on save and affect all future enrollments.
        </p>
      </div>

      <div className="border-t bg-muted/30 p-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit tier
          </Button>
        </div>
      </div>

      <UpsertTierDialog
        mode="edit"
        tier={tier}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={onUpsert}
      />
    </div>
  )
}
