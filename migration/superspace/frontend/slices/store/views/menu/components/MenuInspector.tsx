/**
 * Menu Inspector Component
 * 
 * Inline-editable inspector panel for menu item details
 * Shows: name, description, type, icon, slug
 * Follows WorkspaceInspector pattern for consistency
 */

"use client"

import * as React from "react"
import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import {
  Info,
  Copy,
  Share2,
  Trash2,
  Tag,
  Link,
  Code,
  Eye,
  Pencil,
  Check,
  X,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DynamicIcon, IconPicker } from "@/frontend/shared/ui/icons"
import { InlineColorPicker } from "@/frontend/shared/ui/color-picker"
import { FEATURE_TYPES } from "../constants"
import type { MenuItem } from "../types"

// ============================================================================
// Types
// ============================================================================

interface MenuInspectorProps {
  menuItem: MenuItem | null
  onUpdate?: (menuItemId: Id<"menuItems">, data: Partial<MenuItem>) => Promise<void>
  onDuplicate?: (item: MenuItem) => void
  onShare?: (item: MenuItem) => void
  onDelete?: (itemId: Id<"menuItems">) => void
  onShowFeatures?: (item: MenuItem) => void
  isPreviewOpen?: boolean
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
// Editable Field Component (like WorkspaceInspector)
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

export function MenuInspector({
  menuItem,
  onUpdate,
  onDuplicate,
  onShare,
  onDelete,
  onShowFeatures,
  isPreviewOpen,
  className
}: MenuInspectorProps) {
  // Empty state
  if (!menuItem) {
    return (
      <div className={cn("flex flex-col h-full items-center justify-center p-8 text-center animate-in fade-in-50 duration-500", className)}>
        <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-6 ring-1 ring-border/50">
          <Info className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="font-semibold text-xl tracking-tight mb-2">No Menu Selected</h3>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          Select a menu item from the tree to view its details, or create a new one.
        </p>
      </div>
    )
  }

  // Get feature type config
  const featureType = menuItem.metadata?.featureType as string | undefined
  const featureTypeConfig = featureType && featureType in FEATURE_TYPES
    ? FEATURE_TYPES[featureType as keyof typeof FEATURE_TYPES]
    : null

  // Get icon name from menu item or default based on type
  const getDefaultIcon = (type: string) => {
    switch (type) {
      case "folder": return "Folder"
      case "group": return "Layers"
      case "document": return "FileText"
      case "chat": return "MessageSquare"
      case "route": return "Route"
      case "action": return "Zap"
      case "divider": return "Minus"
      default: return "Hash"
    }
  }

  const iconName = (menuItem as any).icon || getDefaultIcon(menuItem.type)
  const color = menuItem.metadata?.color || "#6366f1"

  const handleUpdate = async (field: string, value: unknown) => {
    if (onUpdate) {
      await onUpdate(menuItem._id, { [field]: value } as Partial<MenuItem>)
    }
  }

  const handleMetadataUpdate = async (field: string, value: unknown) => {
    if (onUpdate) {
      await onUpdate(menuItem._id, {
        metadata: {
          ...menuItem.metadata,
          [field]: value
        }
      } as Partial<MenuItem>)
    }
  }

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
                    onChange={(newColor) => handleMetadataUpdate("color", newColor)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Name & Type Badge - Below Icon */}
          <h2 className="text-xl font-semibold mt-4">{menuItem.name}</h2>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <Badge variant="outline" className="text-xs" style={{ borderColor: color, color }}>
              <Tag className="h-3 w-3 mr-1" />
              {menuItem.type}
            </Badge>
            {menuItem.slug && (
              <Badge variant="secondary" className="text-xs font-mono">
                <Code className="h-3 w-3 mr-1" />
                {menuItem.slug}
              </Badge>
            )}
            {featureTypeConfig && (
              <Badge variant={featureTypeConfig.variant} className="text-xs">
                {featureTypeConfig.label}
              </Badge>
            )}
          </div>

          {/* Show Features Button */}
          {onShowFeatures && (
            <Button aria-label="Show"
              variant={isPreviewOpen ? "default" : "outline"}
              className="mt-4"
              onClick={() => onShowFeatures(menuItem)}
            >
              {isPreviewOpen ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Viewing Features
                </>
              ) : (
                <>
                  <Layers className="h-4 w-4 mr-2" />
                  Show Features
                </>
              )}
            </Button>
          )}
        </div>

        <Separator />

        {/* Editable Fields */}
        <div className="space-y-4">
          <EditableField
            label="Name"
            value={menuItem.name}
            onSave={(value) => handleUpdate("name", value)}
            placeholder="Menu item name"
          />

          <EditableField
            label="Description"
            value={menuItem.metadata?.description || ""}
            onSave={(value) => handleMetadataUpdate("description", value)}
            type="textarea"
            placeholder="Add a description..."
          />

          <EditableField
            label="Slug"
            value={menuItem.slug}
            onSave={(value) => handleUpdate("slug", value)}
            placeholder="menu-slug"
          />

          {menuItem.path !== undefined && (
            <EditableField
              label="Path"
              value={menuItem.path || ""}
              onSave={(value) => handleUpdate("path", value)}
              placeholder="/dashboard/..."
            />
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Actions</Label>
          <div className="flex flex-wrap gap-2">
            {onDuplicate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDuplicate(menuItem)}
                className="gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(menuItem)}
                className="gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(menuItem._id)}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Metadata (Read-only) */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</h4>

          {/* Version */}
          {menuItem.metadata?.version && (
            <div className="flex items-center gap-3 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Version:</span>
              <span className="font-mono">v{menuItem.metadata.version}</span>
            </div>
          )}

          {/* Category */}
          {menuItem.metadata?.category && (
            <div className="flex items-center gap-3 text-sm">
              <Layers className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Category:</span>
              <Badge variant="secondary" className="capitalize">
                {menuItem.metadata.category}
              </Badge>
            </div>
          )}

          {/* Menu ID */}
          <div className="flex items-center gap-3 text-sm">
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">ID:</span>
            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded truncate">
              {menuItem._id}
            </code>
          </div>
        </div>

        {/* Tags */}
        {menuItem.metadata?.tags && Array.isArray(menuItem.metadata.tags) && menuItem.metadata.tags.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tags</Label>
              <div className="flex flex-wrap gap-1">
                {(menuItem.metadata.tags as string[]).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  )
}

export default MenuInspector
