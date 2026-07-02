"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CheckCircle2, MessageSquare } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ChecklistItem, CompletedItem } from "../types"

interface Props {
  index: number
  item: ChecklistItem
  completion: CompletedItem | undefined
  disabled: boolean
  onPersist: (input: {
    itemId: string
    completed: boolean
    photoUrl?: string
    notes?: string
  }) => Promise<void> | void
}

export function RunItemRow({ index, item, completion, disabled, onPersist }: Props) {
  const [photoUrl, setPhotoUrl] = useState(completion?.photoUrl ?? "")
  const [notes, setNotes] = useState(completion?.notes ?? "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep local state in sync if the completion prop changes from outside.
  useEffect(() => {
    setPhotoUrl(completion?.photoUrl ?? "")
    setNotes(completion?.notes ?? "")
  }, [completion?.photoUrl, completion?.notes])

  const completed = !!completion?.completed

  const showPhoto = item.photoRequired || !!completion?.photoUrl
  const showNotes = item.notesRequired || !!completion?.notes

  const persist = (next: {
    completed: boolean
    photoUrl: string
    notes: string
  }) => {
    onPersist({
      itemId: item.id,
      completed: next.completed,
      photoUrl: next.photoUrl.trim() ? next.photoUrl : undefined,
      notes: next.notes.trim() ? next.notes : undefined,
    })
  }

  const handleToggle = (checked: boolean) => {
    if (disabled) return
    persist({ completed: checked, photoUrl, notes })
  }

  const scheduleDebouncedPersist = (next: {
    photoUrl: string
    notes: string
  }) => {
    if (disabled) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      persist({ completed, photoUrl: next.photoUrl, notes: next.notes })
    }, 600)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const photoMissing = item.photoRequired && !photoUrl.trim()
  const notesMissing = item.notesRequired && !notes.trim()
  const blocksComplete = completed && (photoMissing || notesMissing)

  return (
    <div
      className={cn(
        "rounded-md border p-3 transition-colors",
        completed ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "bg-muted/30",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 font-mono text-xs text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="pt-0.5">
          <Checkbox
            checked={completed}
            disabled={disabled}
            onCheckedChange={(v) => handleToggle(Boolean(v))}
            aria-label={completed ? "Uncheck item" : "Check item"}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-sm",
                completed ? "text-emerald-800 line-through dark:text-emerald-200" : "",
              )}
            >
              {item.label}
            </p>
            {item.required ? (
              <Badge variant="secondary" className="text-[10px]">
                Required
              </Badge>
            ) : null}
            {item.photoRequired ? (
              <Badge variant="outline" className="gap-1 text-[10px]">
                <Camera className="h-3 w-3" />
                Photo
              </Badge>
            ) : null}
            {item.notesRequired ? (
              <Badge variant="outline" className="gap-1 text-[10px]">
                <MessageSquare className="h-3 w-3" />
                Notes
              </Badge>
            ) : null}
            {completed ? (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Done
              </span>
            ) : null}
          </div>

          {(showPhoto || showNotes) && (
            <div className="mt-3 grid gap-3">
              {showPhoto ? (
                <div className="grid gap-1">
                  <Label
                    htmlFor={`photo-${item.id}`}
                    className="text-[11px] text-muted-foreground"
                  >
                    Photo URL {item.photoRequired ? "(required)" : "(optional)"}
                  </Label>
                  <Input
                    id={`photo-${item.id}`}
                    type="url"
                    placeholder="https://..."
                    disabled={disabled}
                    value={photoUrl}
                    onChange={(e) => {
                      const v = e.target.value
                      setPhotoUrl(v)
                      scheduleDebouncedPersist({ photoUrl: v, notes })
                    }}
                    className={cn(photoMissing && completed && "border-destructive")}
                  />
                </div>
              ) : null}
              {showNotes ? (
                <div className="grid gap-1">
                  <Label
                    htmlFor={`notes-${item.id}`}
                    className="text-[11px] text-muted-foreground"
                  >
                    Notes {item.notesRequired ? "(required)" : "(optional)"}
                  </Label>
                  <Textarea
                    id={`notes-${item.id}`}
                    rows={2}
                    placeholder="Observations, exceptions, follow-ups..."
                    disabled={disabled}
                    value={notes}
                    onChange={(e) => {
                      const v = e.target.value
                      setNotes(v)
                      scheduleDebouncedPersist({ photoUrl, notes: v })
                    }}
                    className={cn(notesMissing && completed && "border-destructive")}
                  />
                </div>
              ) : null}
            </div>
          )}

          {blocksComplete ? (
            <p className="mt-2 text-[11px] text-destructive">
              {photoMissing && notesMissing
                ? "Photo URL and notes are required before this counts as done."
                : photoMissing
                  ? "Photo URL is required before this counts as done."
                  : "Notes are required before this counts as done."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
