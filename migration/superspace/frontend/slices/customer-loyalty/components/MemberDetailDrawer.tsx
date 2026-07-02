"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Badge as BadgeIcon, TrendingDown, TrendingUp, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import type { Id } from "@convex/_generated/dataModel"
import { MemberLedger } from "./MemberLedger"
import {
  earnPointsSchema,
  redeemPointsSchema,
  type EarnPointsInput,
  type MemberWithTransactions,
  type RedeemPointsInput,
} from "../types"

type InlineMode = "earn" | "redeem" | null

function formatPoints(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)
  } catch {
    return value.toLocaleString()
  }
}

interface Props {
  member: MemberWithTransactions | null | undefined
  onClose: () => void
  onEarn: (id: Id<"loyaltyMembers">, input: EarnPointsInput) => Promise<void> | void
  onRedeem: (id: Id<"loyaltyMembers">, input: RedeemPointsInput) => Promise<void> | void
}

export function MemberDetailDrawer({ member, onClose, onEarn, onRedeem }: Props) {
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<InlineMode>(null)

  if (!member) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Loyalty member</p>
          <h2 className="truncate text-lg font-semibold">{member.name}</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {member.memberNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs capitalize">
            <BadgeIcon className="mr-1 h-3 w-3" />
            {member.tier}
          </Badge>
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 text-sm">
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Balance" value={formatPoints(member.pointsBalance)} tone="primary" />
          <StatTile label="Earned" value={formatPoints(member.totalEarned)} tone="emerald" />
          <StatTile label="Redeemed" value={formatPoints(member.totalRedeemed)} tone="blue" />
        </div>

        <Separator className="my-4" />

        <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="col-span-2 truncate">{member.email ?? "—"}</dd>

          <dt className="text-muted-foreground">Phone</dt>
          <dd className="col-span-2 truncate">{member.phone ?? "—"}</dd>

          <dt className="text-muted-foreground">Join date</dt>
          <dd className="col-span-2">{member.joinDate}</dd>

          <dt className="text-muted-foreground">Last activity</dt>
          <dd className="col-span-2">
            {member.lastActivityAt ? formatRelativeTime(member.lastActivityAt) : "—"}
          </dd>

          <dt className="text-muted-foreground">Contact ID</dt>
          <dd className="col-span-2 truncate font-mono text-xs">
            {member.contactId ?? "—"}
          </dd>

          <dt className="text-muted-foreground">User ID</dt>
          <dd className="col-span-2 truncate font-mono text-xs">
            {member.userId ? String(member.userId) : "—"}
          </dd>

          <dt className="text-muted-foreground">Created</dt>
          <dd className="col-span-2">{formatRelativeTime(member.createdAt)}</dd>
        </dl>

        {member.notes ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{member.notes}</p>
          </>
        ) : null}

        <Separator className="my-4" />
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Points ledger
        </p>
        <div className="mt-3">
          <MemberLedger transactions={member.transactions} />
        </div>
      </div>

      <div className="border-t bg-muted/30 p-3">
        {mode === "earn" ? (
          <EarnForm
            busy={busy}
            onCancel={() => setMode(null)}
            onSubmit={async (input) => {
              setBusy(true)
              try {
                await onEarn(member._id, input)
                setMode(null)
              } finally {
                setBusy(false)
              }
            }}
          />
        ) : mode === "redeem" ? (
          <RedeemForm
            balance={member.pointsBalance}
            busy={busy}
            onCancel={() => setMode(null)}
            onSubmit={async (input) => {
              setBusy(true)
              try {
                await onRedeem(member._id, input)
                setMode(null)
              } finally {
                setBusy(false)
              }
            }}
          />
        ) : (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              size="sm"
              disabled={busy}
              onClick={() => setMode("earn")}
              className="gap-1.5"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Earn points
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy || member.pointsBalance <= 0}
              onClick={() => setMode("redeem")}
              className="gap-1.5"
            >
              <TrendingDown className="h-3.5 w-3.5" />
              Redeem
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Stat tile ----------

function StatTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "primary" | "emerald" | "blue"
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "blue"
        ? "text-blue-600"
        : "text-foreground"
  return (
    <div className="rounded-md border p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("font-mono text-sm font-semibold", toneClass)}>
        {value} <span className="text-xs font-normal text-muted-foreground">pts</span>
      </p>
    </div>
  )
}

// ---------- Inline forms ----------

function EarnForm({
  busy,
  onCancel,
  onSubmit,
}: {
  busy: boolean
  onCancel: () => void
  onSubmit: (input: EarnPointsInput) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EarnPointsInput>({
    resolver: zodResolver(earnPointsSchema),
    defaultValues: { points: 0, referenceAmount: undefined, reference: "", note: "" },
  })

  return (
    <form className="space-y-2" onSubmit={handleSubmit((v) => onSubmit(v))}>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="earn-points" className="text-xs">
            Points
          </Label>
          <Input
            id="earn-points"
            type="number"
            step="1"
            min={1}
            {...register("points")}
            className={cn(errors.points && "border-destructive")}
          />
          {errors.points ? (
            <p className="text-xs text-destructive">{errors.points.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="earn-amount" className="text-xs">
            Reference amount (IDR)
          </Label>
          <Input
            id="earn-amount"
            type="number"
            step="1"
            min={0}
            placeholder="optional"
            {...register("referenceAmount")}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="earn-reference" className="text-xs">
          Reference (optional)
        </Label>
        <Input
          id="earn-reference"
          placeholder="Order #123"
          {...register("reference")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="earn-note" className="text-xs">
          Note (optional)
        </Label>
        <Textarea id="earn-note" rows={2} {...register("note")} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Back
        </Button>
        <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Confirm earn
        </Button>
      </div>
    </form>
  )
}

function RedeemForm({
  balance,
  busy,
  onCancel,
  onSubmit,
}: {
  balance: number
  busy: boolean
  onCancel: () => void
  onSubmit: (input: RedeemPointsInput) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RedeemPointsInput>({
    resolver: zodResolver(redeemPointsSchema),
    defaultValues: { points: 0, reference: "", note: "" },
  })

  const points = Number(watch("points")) || 0
  const remaining = balance - points
  const overdraft = remaining < 0

  return (
    <form className="space-y-2" onSubmit={handleSubmit((v) => onSubmit(v))}>
      <div className="grid gap-2">
        <Label htmlFor="redeem-points" className="text-xs">
          Points to redeem
        </Label>
        <Input
          id="redeem-points"
          type="number"
          step="1"
          min={1}
          {...register("points")}
          className={cn(errors.points && "border-destructive")}
        />
        {errors.points ? (
          <p className="text-xs text-destructive">{errors.points.message}</p>
        ) : null}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">
            Balance: {formatPoints(balance)} pts
          </span>
          <span
            className={cn(
              "font-semibold",
              overdraft ? "text-red-600" : "text-muted-foreground",
            )}
          >
            Remaining: {formatPoints(remaining)} pts
          </span>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="redeem-reference" className="text-xs">
          Reference (optional)
        </Label>
        <Input
          id="redeem-reference"
          placeholder="Voucher code"
          {...register("reference")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="redeem-note" className="text-xs">
          Note (optional)
        </Label>
        <Textarea id="redeem-note" rows={2} {...register("note")} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Back
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={busy || overdraft}
          className="gap-1.5"
        >
          <TrendingDown className="h-3.5 w-3.5" />
          Confirm redeem
        </Button>
      </div>
    </form>
  )
}
