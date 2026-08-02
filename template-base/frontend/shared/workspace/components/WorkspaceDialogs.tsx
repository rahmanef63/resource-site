/**
 * Workspace Dialogs
 *
 * Create, Edit, Delete, and Move workspace dialogs.
 * All wrapped in ResponsiveDialog so they adapt to mobile drawers.
 */

"use client"

import * as React from "react"
import { Loader2, Download } from "lucide-react"
import { ResponsiveDialog } from "@/frontend/shared/ui"
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
import { InlineColorPicker } from "./ColorPicker"
import { IconPicker, DynamicIcon } from "./IconPicker"
import { WORKSPACE_TYPE_OPTIONS } from "../constants"
import type { WorkspaceStoreItem, WorkspaceType } from "../types"
import { CreateWorkspaceAdvancedDialog } from "@/frontend/shared/foundation/workspaces/components/CreateWorkspaceAdvancedDialog"
import { useWorkspaceExportImport } from "@/frontend/shared/foundation/hooks/useWorkspaceExportImport"
import type { Id } from "@/convex/_generated/dataModel"

// ============================================================================
// Create Workspace Dialog
// ============================================================================

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
    bundleId?: string
    templateId?: string
    enabledFeatures?: string[]
    parentId?: string
  }) => Promise<void>
  /** @deprecated Import/join flows now close the dialog internally via the shared panels. */
  onImportComplete?: (workspaceId: Id<"workspaces">) => void
  parentWorkspace?: WorkspaceStoreItem | null
}

/**
 * Thin compatibility wrapper around CreateWorkspaceAdvancedDialog — the SSOT
 * create-workspace dialog shared by the workspace store page, the sidebar
 * switcher drawer, and the app sidebar's child-workspace creation flow.
 *
 * This wrapper preserves the old prop shape (onSubmit signature and
 * parentWorkspace object) so existing call sites keep working.
 */

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSubmit,
  parentWorkspace,
}: CreateWorkspaceDialogProps) {
  const handleSubmit = React.useCallback(
    async (data: {
      name: string
      description?: string
      type: WorkspaceType
      icon?: string
      color?: string
      bundleId?: string
      parentId?: string
      templateId?: Id<"industryTemplates">
      enabledFeatures?: string[]
    }) => {
      await onSubmit({
        ...data,
        templateId: data.templateId as unknown as string | undefined,
        parentId: data.parentId ?? (parentWorkspace?.id as string | undefined),
      })
    },
    [onSubmit, parentWorkspace?.id],
  )

  return (
    <CreateWorkspaceAdvancedDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      parentWorkspaceId={parentWorkspace?.id as string | undefined}
      parentWorkspaceName={parentWorkspace?.name}
    />
  )
}


// ============================================================================
// Edit Workspace Dialog
// ============================================================================

interface EditWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: WorkspaceStoreItem | null
  onSubmit: (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
  }) => Promise<void>
}

export function EditWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  onSubmit,
}: EditWorkspaceDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [type, setType] = React.useState<WorkspaceType>("group")
  const [icon, setIcon] = React.useState("Folder")
  const [color, setColor] = React.useState("#3B82F6")
  const [loading, setLoading] = React.useState(false)
  const [showIconPicker, setShowIconPicker] = React.useState(false)
  const { isExporting, exportWorkspace } = useWorkspaceExportImport(
    workspace?.id as Id<"workspaces"> | undefined
  )

  React.useEffect(() => {
    if (workspace) {
      setName(workspace.name)
      setDescription(workspace.description || "")
      setType(workspace.type)
      setIcon(workspace.icon || "Folder")
      setColor(workspace.color || "#3B82F6")
    }
  }, [workspace])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        icon,
        color,
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Edit Workspace</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Update workspace details.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <form id="edit-workspace-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WorkspaceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKSPACE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-12"
                  onClick={() => setShowIconPicker(true)}
                >
                  <DynamicIcon name={icon} className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <Label>Color</Label>
                <InlineColorPicker value={color} onChange={setColor} showCustom />
              </div>
            </div>
          </form>
        </ResponsiveDialog.Body>

        <ResponsiveDialog.Footer className="flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 sm:mr-auto"
            onClick={() => exportWorkspace({ includeMembers: true })}
            disabled={isExporting}
          >
            {isExporting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Download className="h-3.5 w-3.5" />}
            Export
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="edit-workspace-form" disabled={loading || !name.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>

      <IconPicker
        icon={icon}
        onIconChange={setIcon}
        onClose={() => setShowIconPicker(false)}
        asDialog
        open={showIconPicker}
        onOpenChange={setShowIconPicker}
      />
    </>
  )
}

// ============================================================================
// Delete Confirmation Dialog
// ============================================================================

interface DeleteWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: WorkspaceStoreItem | null
  onConfirm: () => Promise<void>
  hasChildren?: boolean
}

export function DeleteWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  onConfirm,
  hasChildren = false,
}: DeleteWorkspaceDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="alert" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Delete Workspace</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Are you sure you want to delete <strong>{workspace?.name}</strong>?
          {hasChildren && (
            <span className="mt-2 block text-destructive">
              This workspace has child workspaces. Deleting it will orphan
              those children or move them to the parent level.
            </span>
          )}
          <span className="mt-2 block">
            This action cannot be undone.
          </span>
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Delete
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}

// ============================================================================
// Move Workspace Dialog
// ============================================================================

interface MoveWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: WorkspaceStoreItem | null
  availableTargets: WorkspaceStoreItem[]
  onSubmit: (targetParentId: string | null) => Promise<void>
}

export function MoveWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  availableTargets,
  onSubmit,
}: MoveWorkspaceDialogProps) {
  const [targetId, setTargetId] = React.useState<string>("root")
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(targetId === "root" ? null : targetId)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Move Workspace</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Move <strong>{workspace?.name}</strong> to a new parent.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <form id="move-workspace-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-parent">New Parent</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">
                  (Root Level - No Parent)
                </SelectItem>
                {availableTargets.map((target) => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" form="move-workspace-form" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Move
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}
