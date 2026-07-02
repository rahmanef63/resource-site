/**
 * Workspace Inspector Component
 * 
 * Inline-editable inspector panel for workspace details
 * Shows: name, description, type, icon, color, owner, created/updated time
 * Includes: Danger Zone for delete/reset operations
 */

"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  User,
  Calendar,
  Clock,
  Pencil,
  Check,
  X,
  Building2,
  Home,
  Users,
  Heart,
  Briefcase,
  Info,
  Layers,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Globe,
  Lock,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DynamicIcon, IconPicker } from "@/frontend/shared/ui/icons"
import { InlineColorPicker } from "@/frontend/shared/ui/color-picker"
import { usePostWorkspaceDeleteNavigation } from "@/frontend/shared/foundation/workspaces/hooks/usePostWorkspaceDeleteNavigation"
import { WORKSPACE_TYPE_OPTIONS } from "../constants"
import type { WorkspaceStoreItem, WorkspaceType } from "../types"
import { toast } from "sonner"

// ============================================================================
// Types
// ============================================================================

interface WorkspaceInspectorProps {
  workspace: WorkspaceStoreItem | null
  onUpdate?: (workspaceId: string, data: Partial<WorkspaceStoreItem>) => Promise<void>
  onShowFeatures?: () => void
  className?: string
}

interface EditableFieldProps {
  label: string
  value: string
  onSave: (value: string) => Promise<void>
  type?: "text" | "textarea"
  placeholder?: string
}

// ============================================================================
// Type Icon Map
// ============================================================================

const TYPE_ICONS: Record<WorkspaceType, React.ElementType> = {
  personal: Home,
  organization: Building2,
  institution: Building2,
  group: Users,
  family: Heart,
}

// ============================================================================
// Editable Field Component
// ============================================================================

function EditableField({ label, value, onSave, type = "text", placeholder }: EditableFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && type === "text") {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      handleCancel()
    }
  }

  // Sync value when props change
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(value)
    }
  }, [value, isEditing])

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="flex items-start gap-2">
          {type === "textarea" ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[80px] text-sm"
              autoFocus
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="text-sm"
              autoFocus
            />
          )}
          <div className="flex flex-col gap-1">
            <Button aria-label="Confirm"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="h-3.5 w-3.5 text-green-500" />
            </Button>
            <Button aria-label="Close"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1 group">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div
        className="flex items-start justify-between gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={() => setIsEditing(true)}
      >
        <p className={cn("text-sm flex-1", !value && "text-muted-foreground italic")}>
          {value || placeholder || "Click to edit..."}
        </p>
        <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function WorkspaceInspector({
  workspace,
  onUpdate,
  onShowFeatures,
  className
}: WorkspaceInspectorProps) {
  // Query owner user info
  const ownerUser = useQuery(
    api.user.users.getById,
    workspace?.createdBy ? { userId: workspace.createdBy as Id<"users"> } : "skip"
  )

  if (!workspace) {
    return (
      <div className={cn("flex flex-col h-full items-center justify-center p-8 text-center animate-in fade-in-50 duration-500", className)}>
        <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-6 ring-1 ring-border/50">
          <Info className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="font-semibold text-xl tracking-tight mb-2">No Workspace Selected</h3>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          Select a workspace from the list to view its details or create a new one.
        </p>
      </div>
    )
  }

  const handleUpdate = async (field: string, value: unknown) => {
    if (onUpdate) {
      await onUpdate(workspace.id, { [field]: value })
    }
  }

  const TypeIcon = TYPE_ICONS[workspace.type] || Briefcase
  const iconName = workspace.icon || "Briefcase"
  const color = workspace.color || "#6366f1"

  // Resolve owner display name
  const ownerDisplayName = ownerUser?.name || ownerUser?.email || "Unknown"

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="p-4 space-y-6">
        {/* Header - Centered Icon with Name below */}
        <div className="flex flex-col items-center text-center pt-2">
          {/* Editable Icon - Centered & Larger */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex h-20 w-20 items-center justify-center rounded-xl text-white shrink-0 hover:opacity-80 transition-opacity shadow-lg"
                style={{ backgroundColor: color }}
              >
                <DynamicIcon name={iconName} className="h-10 w-10" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="center">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Icon</div>
                  <IconPicker
                    icon={iconName}
                    onIconChange={(newIcon) => handleUpdate("icon", newIcon)}
                    showColor={false}
                    showBackground={false}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Color</div>
                  <InlineColorPicker
                    value={color}
                    onChange={(newColor) => handleUpdate("color", newColor)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Name & Type Badge - Below Icon */}
          <h2 className="text-xl font-semibold mt-4">{workspace.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs" style={{ borderColor: color, color }}>
              <TypeIcon className="h-3 w-3 mr-1" />
              {WORKSPACE_TYPE_OPTIONS.find(o => o.value === workspace.type)?.label || workspace.type}
            </Badge>
            {workspace.isMainWorkspace && (
              <Badge variant="secondary" className="text-xs">Main</Badge>
            )}
          </div>

          {/* Show Features Button - Below badges */}
          {onShowFeatures && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={onShowFeatures}
            >
              <Layers className="h-4 w-4 mr-2" />
              Show Available Features
            </Button>
          )}
        </div>

        <Separator />

        {/* Editable Fields */}
        <div className="space-y-4">
          <EditableField
            label="Name"
            value={workspace.name}
            onSave={(value) => handleUpdate("name", value)}
            placeholder="Workspace name"
          />

          <EditableField
            label="Description"
            value={workspace.description || ""}
            onSave={(value) => handleUpdate("description", value)}
            type="textarea"
            placeholder="Add a description..."
          />

          {/* Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select
              value={workspace.type}
              onValueChange={(value) => handleUpdate("type", value)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORKSPACE_TYPE_OPTIONS.map((opt) => {
                  const Icon = TYPE_ICONS[opt.value as WorkspaceType] || Briefcase
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Metadata (Read-only) */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</h4>

          {/* Owner */}
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Owner:</span>
            <span className="font-medium truncate">
              {ownerDisplayName}
            </span>
          </div>

          {/* Created */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              {workspace._creationTime
                ? format(new Date(workspace._creationTime), "MMM d, yyyy 'at' h:mm a")
                : "Unknown"
              }
            </span>
          </div>

          {/* Updated */}
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Updated:</span>
            <span className="font-medium">
              {workspace.updatedAt
                ? format(new Date(workspace.updatedAt), "MMM d, yyyy 'at' h:mm a")
                : "Never"
              }
            </span>
          </div>

          {/* Workspace ID */}
          <div className="flex items-center gap-3 text-sm">
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">ID:</span>
            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded truncate">
              {workspace.id}
            </code>
          </div>
        </div>

        <Separator />

        {/* Visibility Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Visibility</h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {workspace.isPublic ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <div className="text-sm font-medium">
                  {workspace.isPublic ? "Public" : "Private"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {workspace.isPublic
                    ? "Anyone can find and request to join"
                    : "Only invited members can access"
                  }
                </div>
              </div>
            </div>
            <Switch
              checked={workspace.isPublic ?? false}
              onCheckedChange={(checked) => handleUpdate("isPublic", checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Danger Zone */}
        <DangerZone
          workspaceId={workspace.id as Id<"workspaces">}
          workspaceName={workspace.name}
        />
      </div>
    </ScrollArea>
  )
}

// ============================================================================
// Danger Zone Component
// ============================================================================

interface DangerZoneProps {
  workspaceId: Id<"workspaces">
  workspaceName: string
}

function DangerZone({ workspaceId, workspaceName }: DangerZoneProps) {
  const deleteWorkspace = useMutation((api.workspace.workspaces as any).deleteWorkspace)
  const resetWorkspace = useMutation((api.workspace.workspaces as any).resetWorkspace)
  const navigateAfterWorkspaceDelete = usePostWorkspaceDeleteNavigation()

  const [showResetDialog, setShowResetDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [resetMode, setResetMode] = React.useState<'replaceMenus' | 'clean'>('replaceMenus')
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isResetting, setIsResetting] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteWorkspace({ workspaceId })
      navigateAfterWorkspaceDelete(workspaceId)
      toast.success("Workspace deleted", {
        description: "Your workspace has been permanently deleted",
      })
    } catch (error) {
      toast.error("Failed to delete workspace", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await resetWorkspace({ workspaceId, mode: resetMode })
      toast.success("Workspace reset", {
        description: resetMode === 'clean'
          ? "All data has been cleared"
          : "Menus have been replaced with defaults",
      })
      setShowResetDialog(false)
    } catch (error) {
      toast.error("Failed to reset workspace", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-destructive uppercase tracking-wider flex items-center gap-2">
        <AlertTriangle className="h-3 w-3" />
        Danger Zone
      </h4>

      <div className="space-y-3 p-3 border border-destructive/30 rounded-lg bg-destructive/5">
        {/* Reset Workspace */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Reset Workspace</div>
            <div className="text-xs text-muted-foreground">
              Clear data or restore default menus
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
        </div>

        <Separator className="bg-destructive/20" />

        {/* Delete Workspace */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Delete Workspace</div>
            <div className="text-xs text-muted-foreground">
              Permanently delete this workspace
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Reset Dialog */}
      <ResponsiveDialog open={showResetDialog} onOpenChange={setShowResetDialog} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Reset Workspace</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Choose how you want to reset &quot;{workspaceName}&quot;
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>
        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <RadioGroup value={resetMode} onValueChange={(v) => setResetMode(v as typeof resetMode)}>
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <RadioGroupItem value="replaceMenus" id="replaceMenus" />
              <Label htmlFor="replaceMenus" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-medium">Replace menus with defaults</span>
                <span className="text-xs text-muted-foreground">
                  Restore default menu items. Your data will be preserved.
                </span>
              </Label>
            </div>
            <div className="flex items-start space-x-3 p-3 border rounded-lg border-destructive/30">
              <RadioGroupItem value="clean" id="clean" />
              <Label htmlFor="clean" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-medium text-destructive">Clean reset</span>
                <span className="text-xs text-muted-foreground">
                  Clear all data including documents, tasks, and settings. This cannot be undone.
                </span>
              </Label>
            </div>
          </RadioGroup>
        </ResponsiveDialog.Body>
        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={() => setShowResetDialog(false)}>
            Cancel
          </Button>
          <Button
            variant={resetMode === 'clean' ? 'destructive' : 'default'}
            onClick={handleReset}
            disabled={isResetting}
          >
            {isResetting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {resetMode === 'clean' ? 'Reset Everything' : 'Reset Menus'}
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <ResponsiveDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} variant="alert" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Delete &quot;{workspaceName}&quot;?</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            This action cannot be undone. This will permanently delete the workspace
            and all its data, including documents, tasks, members, and settings.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>
        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete Workspace
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>
    </div>
  )
}

export default WorkspaceInspector
