/**
 * Shared Dialogs for Conversations
 * Used by Chat, AI, and other conversation-like features
 * @module shared/communications/conversation
 */

"use client"

import * as React from "react"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera } from "lucide-react"
import type { ConversationItem, ConversationContext, ConversationLabels } from "./types"
import { getLabels } from "./types"

// ============================================================================
// Utility Functions
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ============================================================================
// Edit/Rename Dialog
// ============================================================================

export interface EditConversationDialogProps<T extends ConversationItem = ConversationItem> {
  /** The conversation item to edit */
  item: T | null
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog is closed */
  onClose: () => void
  /** Callback when changes are saved */
  onSave: (id: string, data: { name?: string; description?: string }) => Promise<void>
  /** Whether save is in progress */
  isLoading?: boolean
  /** Context for label customization */
  context?: ConversationContext
  /** Custom labels override */
  labels?: Partial<ConversationLabels>
  /** Whether to show description field */
  showDescription?: boolean
  /** Whether to show avatar */
  showAvatar?: boolean
  /** Whether to allow avatar upload (future feature) */
  allowAvatarUpload?: boolean
}

export function EditConversationDialog<T extends ConversationItem = ConversationItem>({
  item,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  context = 'chat',
  labels: customLabels,
  showDescription = true,
  showAvatar = true,
  allowAvatarUpload = false,
}: EditConversationDialogProps<T>) {
  const labels = getLabels(context, customLabels)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  // Reset form when dialog opens with new item
  React.useEffect(() => {
    if (item && isOpen) {
      setName(item.name || "")
      setDescription(item.description || "")
    }
  }, [item, isOpen])

  const handleSave = async () => {
    if (!item) return
    await onSave(item.id, { 
      name: name.trim() || undefined, 
      description: showDescription ? (description.trim() || undefined) : undefined 
    })
    onClose()
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    onClose()
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} variant="modal" size="sm">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>{labels.editTitle || labels.editLabel || `Edit ${labels.itemType}`}</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          {labels.editDescription || `Update the ${labels.itemType?.toLowerCase()} details.`}
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="grid gap-4">
          {/* Avatar Preview */}
          {showAvatar && (
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={item?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                    {getInitials(name || item?.name || "?")}
                  </AvatarFallback>
                </Avatar>
                {allowAvatarUpload && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
                    disabled
                    title="Upload custom avatar"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Name Input */}
          <div className="grid gap-2">
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${labels.itemType} name...`}
              disabled={isLoading}
            />
          </div>

          {/* Description Input */}
          {showDescription && (
            <div className="grid gap-2">
              <Label htmlFor="item-description">Description (optional)</Label>
              <Textarea
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button variant="outline" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading || !name.trim()}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}

// ============================================================================
// Delete Confirmation Dialog
// ============================================================================

export interface DeleteConversationDialogProps<T extends ConversationItem = ConversationItem> {
  /** The conversation item to delete */
  item: T | null
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog is closed */
  onClose: () => void
  /** Callback when deletion is confirmed */
  onConfirm: (id: string) => Promise<void>
  /** Whether deletion is in progress */
  isLoading?: boolean
  /** Context for label customization */
  context?: ConversationContext
  /** Custom labels override */
  labels?: Partial<ConversationLabels>
}

export function DeleteConversationDialog<T extends ConversationItem = ConversationItem>({
  item,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  context = 'chat',
  labels: customLabels,
}: DeleteConversationDialogProps<T>) {
  const labels = getLabels(context, customLabels)

  const handleConfirm = async () => {
    if (!item) return
    await onConfirm(item.id)
    onClose()
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()} variant="alert" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>
          {labels.deleteTitle || `Delete ${labels.itemType}?`}
        </ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          {labels.deleteDescription ||
            `This action cannot be undone. This will permanently delete "${item?.name}".`}
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button
          variant="destructive"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Delete
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}

// ============================================================================
// Leave Confirmation Dialog
// ============================================================================

export interface LeaveConversationDialogProps<T extends ConversationItem = ConversationItem> {
  /** The conversation item to leave */
  item: T | null
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog is closed */
  onClose: () => void
  /** Callback when leaving is confirmed */
  onConfirm: (id: string) => Promise<void>
  /** Whether leaving is in progress */
  isLoading?: boolean
  /** Context for label customization */
  context?: ConversationContext
  /** Custom labels override */
  labels?: Partial<ConversationLabels>
}

export function LeaveConversationDialog<T extends ConversationItem = ConversationItem>({
  item,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  context = 'chat',
  labels: customLabels,
}: LeaveConversationDialogProps<T>) {
  const labels = getLabels(context, customLabels)

  const handleConfirm = async () => {
    if (!item) return
    await onConfirm(item.id)
    onClose()
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()} variant="alert" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>
          {labels.leaveTitle || 'Leave Conversation?'}
        </ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          {labels.leaveDescription ||
            `Are you sure you want to leave "${item?.name}"? You won't be able to see new messages unless you're added back.`}
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Leave
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}

// ============================================================================
// Archive Confirmation Dialog (Optional - for features that need confirmation)
// ============================================================================

export interface ArchiveConversationDialogProps<T extends ConversationItem = ConversationItem> {
  /** The conversation item to archive */
  item: T | null
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog is closed */
  onClose: () => void
  /** Callback when archive is confirmed */
  onConfirm: (id: string, isArchived: boolean) => Promise<void>
  /** Whether archive is in progress */
  isLoading?: boolean
  /** Context for label customization */
  context?: ConversationContext
  /** Custom labels override */
  labels?: Partial<ConversationLabels>
}

export function ArchiveConversationDialog<T extends ConversationItem = ConversationItem>({
  item,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  context = 'chat',
  labels: customLabels,
}: ArchiveConversationDialogProps<T>) {
  const labels = getLabels(context, customLabels)
  const isCurrentlyArchived = item?.isArchived || false

  const handleConfirm = async () => {
    if (!item) return
    await onConfirm(item.id, !isCurrentlyArchived)
    onClose()
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()} variant="alert" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>
          {isCurrentlyArchived
            ? `Unarchive ${labels.itemType}?`
            : `Archive ${labels.itemType}?`}
        </ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          {isCurrentlyArchived
            ? `This will move "${item?.name}" back to your active ${labels.itemTypePlural?.toLowerCase()}.`
            : `This will move "${item?.name}" to your archived ${labels.itemTypePlural?.toLowerCase()}.`}
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCurrentlyArchived ? 'Unarchive' : 'Archive'}
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}

export default {
  EditConversationDialog,
  DeleteConversationDialog,
  LeaveConversationDialog,
  ArchiveConversationDialog,
}
