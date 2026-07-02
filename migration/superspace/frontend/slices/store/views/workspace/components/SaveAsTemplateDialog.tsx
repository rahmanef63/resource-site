"use client"

import * as React from "react"
import { useMutation } from "convex/react"
import { toast } from "sonner"
import { Loader2, LayoutTemplate } from "lucide-react"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

type TemplateCategory = "business" | "personal" | "team" | "project" | "industry" | "custom"

const CATEGORY_OPTIONS: { value: TemplateCategory; label: string }[] = [
  { value: "business", label: "Business" },
  { value: "team", label: "Team" },
  { value: "project", label: "Project" },
  { value: "personal", label: "Personal" },
  { value: "industry", label: "Industry" },
  { value: "custom", label: "Custom" },
]

export interface SaveAsTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: Id<"workspaces">
  workspaceName: string
}

export function SaveAsTemplateDialog({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
}: SaveAsTemplateDialogProps) {
  const saveAsTemplate = useMutation(api.workspace.templates.saveWorkspaceAsTemplate)

  const [name, setName] = React.useState(`${workspaceName} Template`)
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState<TemplateCategory>("custom")
  const [includeCustomRoles, setIncludeCustomRoles] = React.useState(true)
  const [isPublic, setIsPublic] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setName(`${workspaceName} Template`)
      setDescription("")
      setCategory("custom")
      setIncludeCustomRoles(true)
      setIsPublic(false)
    }
  }, [open, workspaceName])

  const handleSave = React.useCallback(async () => {
    if (!name.trim()) {
      toast.error("Template name is required")
      return
    }
    setSaving(true)
    try {
      await saveAsTemplate({
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        includeCustomRoles,
        isPublic,
      })
      toast.success("Template saved")
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save template"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }, [name, description, category, includeCustomRoles, isPublic, saveAsTemplate, workspaceId, onOpenChange])

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Save as template
        </ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Snapshot this workspace&apos;s settings, features, and (optionally) custom roles as a reusable template.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="space-y-4 px-4 py-4 sm:px-6">
        <div className="space-y-1.5">
          <Label htmlFor="template-name">Name</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My workspace template"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="template-description">Description</Label>
          <Textarea
            id="template-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this template for?"
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="template-category">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
            <SelectTrigger id="template-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="include-roles" className="text-sm">Include custom roles</Label>
            <p className="text-xs text-muted-foreground">Copy non-system roles into the template</p>
          </div>
          <Switch id="include-roles" checked={includeCustomRoles} onCheckedChange={setIncludeCustomRoles} />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="is-public" className="text-sm">Share with everyone</Label>
            <p className="text-xs text-muted-foreground">Make this template visible to all users</p>
          </div>
          <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
        </div>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !name.trim()}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save template
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}
