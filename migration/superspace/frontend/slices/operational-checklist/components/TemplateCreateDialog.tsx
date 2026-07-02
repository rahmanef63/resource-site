"use client"

import { useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { cn } from "@/lib/utils"
import {
  SCOPES,
  SCOPE_LABELS,
  createTemplateSchema,
  type CreateTemplateInput,
  type Scope,
} from "../types"

interface TemplateCreateDialogProps {
  trigger?: React.ReactNode
  onCreate: (input: CreateTemplateInput) => Promise<unknown>
}

export function TemplateCreateDialog({ trigger, onCreate }: TemplateCreateDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTemplateInput>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: "",
      scope: "opening",
      description: "",
      branchId: "",
      items: [
        { label: "", required: true, photoRequired: false, notesRequired: false },
      ],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onCreate({
        ...values,
        description: values.description?.trim() ? values.description : undefined,
        branchId: values.branchId?.trim() ? values.branchId : undefined,
      })
      reset()
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
          <Plus className="h-4 w-4" />
          New template
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="lg">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>New checklist template</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Define the items a run must work through. Required items gate run
            completion.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="name">Template name</Label>
                <Input
                  id="name"
                  placeholder="Morning opening checklist"
                  {...register("name")}
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name ? (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scope">Scope</Label>
                <Controller
                  control={control}
                  name="scope"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as Scope)}
                    >
                      <SelectTrigger id="scope">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCOPES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {SCOPE_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                rows={2}
                placeholder="When is this checklist used?"
                {...register("description")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="branchId">Branch (optional)</Label>
              <Input id="branchId" placeholder="jakarta-01" {...register("branchId")} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Items</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() =>
                    append({
                      label: "",
                      required: true,
                      photoRequired: false,
                      notesRequired: false,
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add item
                </Button>
              </div>

              {typeof errors.items?.message === "string" ? (
                <p className="text-xs text-destructive">{errors.items.message}</p>
              ) : null}

              <div className="space-y-2">
                {fields.map((field, idx) => {
                  const itemErr = errors.items?.[idx]
                  return (
                    <div
                      key={field.id}
                      className="rounded-md border bg-muted/30 p-3 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col gap-1 pt-1">
                          <Button aria-label="Up"
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            disabled={idx === 0}
                            onClick={() => move(idx, idx - 1)}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button aria-label="Down"
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            disabled={idx === fields.length - 1}
                            onClick={() => move(idx, idx + 1)}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="grid flex-1 gap-1.5">
                          <Label
                            htmlFor={`items.${idx}.label`}
                            className="text-xs text-muted-foreground"
                          >
                            Item {idx + 1}
                          </Label>
                          <Input
                            id={`items.${idx}.label`}
                            placeholder="Verify front door is unlocked"
                            {...register(`items.${idx}.label` as const)}
                            className={cn(itemErr?.label && "border-destructive")}
                          />
                          {itemErr?.label?.message ? (
                            <p className="text-xs text-destructive">
                              {itemErr.label.message}
                            </p>
                          ) : null}
                        </div>
                        <Button aria-label="Delete"
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          disabled={fields.length <= 1}
                          onClick={() => remove(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-4 pl-8 text-xs">
                        <Controller
                          control={control}
                          name={`items.${idx}.required` as const}
                          render={({ field: f }) => (
                            <label className="flex cursor-pointer items-center gap-2">
                              <Switch
                                checked={!!f.value}
                                onCheckedChange={(v) => f.onChange(v)}
                              />
                              <span>Required</span>
                            </label>
                          )}
                        />
                        <Controller
                          control={control}
                          name={`items.${idx}.photoRequired` as const}
                          render={({ field: f }) => (
                            <label className="flex cursor-pointer items-center gap-2">
                              <Switch
                                checked={!!f.value}
                                onCheckedChange={(v) => f.onChange(v)}
                              />
                              <span>Photo required</span>
                            </label>
                          )}
                        />
                        <Controller
                          control={control}
                          name={`items.${idx}.notesRequired` as const}
                          render={({ field: f }) => (
                            <label className="flex cursor-pointer items-center gap-2">
                              <Switch
                                checked={!!f.value}
                                onCheckedChange={(v) => f.onChange(v)}
                              />
                              <span>Notes required</span>
                            </label>
                          )}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Create template"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
