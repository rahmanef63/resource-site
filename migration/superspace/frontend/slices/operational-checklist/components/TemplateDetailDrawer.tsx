"use client"

import { Camera, ListChecks, MessageSquare, Play, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { cn } from "@/lib/utils"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import type { ChecklistTemplate } from "../types"
import { SCOPE_LABELS } from "../types"

interface Props {
  template: ChecklistTemplate | null
  onClose: () => void
  onStartRun: (template: ChecklistTemplate) => void
}

export function TemplateDetailDrawer({ template, onClose, onStartRun }: Props) {
  if (!template) return null

  const sortedItems = [...template.items].sort((a, b) => a.order - b.order)

  return (
    <PanelSection>
      <PanelSection.Header className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Checklist template
          </p>
          <h2 className="truncate text-lg font-semibold">{template.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {template.items.length} items · {SCOPE_LABELS[template.scope]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              template.isActive
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
            )}
          >
            {template.isActive ? "Active" : "Paused"}
          </Badge>
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items className="p-4 text-sm">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">Scope</dt>
          <dd className="col-span-2">{SCOPE_LABELS[template.scope]}</dd>

          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2 truncate">{template.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Created</dt>
          <dd className="col-span-2">{formatRelativeTime(template.createdAt)}</dd>

          <dt className="text-muted-foreground">Updated</dt>
          <dd className="col-span-2">{formatRelativeTime(template.updatedAt)}</dd>
        </dl>

        {template.description ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{template.description}</p>
          </>
        ) : null}

        <Separator className="my-4" />
        <div className="flex items-center gap-2">
          <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Items ({sortedItems.length})
          </p>
        </div>

        <ul className="mt-2 space-y-1.5">
          {sortedItems.map((item, idx) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-md border bg-muted/30 p-2.5"
            >
              <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{item.label}</p>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
                  {item.required ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Required
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Optional
                    </Badge>
                  )}
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
                </div>
              </div>
            </li>
          ))}
        </ul>
      </PanelSection.Items>

      <PanelSection.Footer className="p-3">
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            className="gap-1.5"
            disabled={!template.isActive}
            onClick={() => onStartRun(template)}
          >
            <Play className="h-3.5 w-3.5" />
            Start run
          </Button>
        </div>
      </PanelSection.Footer>
    </PanelSection>
  )
}
