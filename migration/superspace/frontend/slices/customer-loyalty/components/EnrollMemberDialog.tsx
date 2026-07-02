"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { DateField } from "@/frontend/shared/foundation/utils/datepicker"
import { cn } from "@/lib/utils"
import {
  enrollMemberSchema,
  type EnrollMemberInput,
  type LoyaltyTier,
} from "../types"

interface EnrollMemberDialogProps {
  trigger?: React.ReactNode
  tiers: LoyaltyTier[]
  onEnroll: (input: EnrollMemberInput) => Promise<unknown>
}

export function EnrollMemberDialog({ trigger, tiers, onEnroll }: EnrollMemberDialogProps) {
  const [open, setOpen] = useState(false)

  const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints)
  const defaultTier = sortedTiers[0]?.name ?? ""

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnrollMemberInput>({
    resolver: zodResolver(enrollMemberSchema),
    defaultValues: {
      memberNumber: "",
      name: "",
      email: "",
      phone: "",
      tier: defaultTier,
      joinDate: new Date().toISOString().slice(0, 10),
      contactId: "",
      userId: "",
      notes: "",
    },
  })

  const tier = watch("tier") ?? defaultTier

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onEnroll({
        ...values,
        email: values.email || undefined,
        phone: values.phone || undefined,
        tier: values.tier || undefined,
        joinDate: values.joinDate || undefined,
        contactId: values.contactId || undefined,
        userId: values.userId || undefined,
      })
      reset({
        memberNumber: "",
        name: "",
        email: "",
        phone: "",
        tier: defaultTier,
        joinDate: new Date().toISOString().slice(0, 10),
        contactId: "",
        userId: "",
        notes: "",
      })
      setOpen(false)
    } catch {
      /* toast handled in hook */
    }
  })

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Enroll member
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Enroll new member</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Register a customer in the loyalty program. They start with a zero points balance.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="memberNumber">Member number</Label>
                <Input
                  id="memberNumber"
                  placeholder="LP-0001"
                  {...register("memberNumber")}
                  className={cn(errors.memberNumber && "border-destructive")}
                />
                {errors.memberNumber ? (
                  <p className="text-xs text-destructive">{errors.memberNumber.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Rina Putri"
                  {...register("name")}
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name ? (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="rina@example.com"
                  {...register("email")}
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email ? (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+62 812..." {...register("phone")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="tier">Starting tier</Label>
                {sortedTiers.length > 0 ? (
                  <Select
                    value={tier}
                    onValueChange={(v) => setValue("tier", v)}
                  >
                    <SelectTrigger id="tier">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedTiers.map((t) => (
                        <SelectItem key={t._id} value={t.name}>
                          <span className="capitalize">{t.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ≥ {t.minPoints.toLocaleString()} pts
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="tier"
                    placeholder="bronze"
                    {...register("tier")}
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="joinDate">Join date</Label>
                <DateField name="joinDate" control={control} placeholder="Pick a date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="contactId">Contact ID (optional)</Label>
                <Input id="contactId" placeholder="contacts/..." {...register("contactId")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="userId">User ID (optional)</Label>
                <Input id="userId" placeholder="users/..." {...register("userId")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Enrolling…" : "Enroll member"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
