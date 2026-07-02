"use client"

import React, { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link as LinkIcon,
  Sparkles,
  Calendar,
  User,
  Tag,
  Folder,
  ExternalLink,
  Download,
  Copy,
  Trash2,
  Eye,
  Check,
  X,
  Pencil,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Star,
  Loader2,
  SlidersHorizontal,
  Maximize2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageCropApply, ImageCropReset } from "@/components/ui/shadcn-io/image-crop"
import type { Id } from "@convex/_generated/dataModel"
import type { ContentType } from "../hooks/useContentLibrary"

type EditorMode = "transform" | "adjust" | "crop" | "preview"

type ImageEditChanges = {
  rotation: number
  flipH: boolean
  flipV: boolean
  brightness: number
  contrast: number
  saturation: number
  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
  zoom: number
}

type ImageEditorState = {
  activeMode: EditorMode
  setActiveMode: (mode: EditorMode) => void
  changes: ImageEditChanges
  updateChanges: (changes: Partial<ImageEditChanges>) => void
  rotate: (direction: "cw" | "ccw") => void
  flip: (axis: "h" | "v") => void
  undo: () => void
  redo: () => void
  resetAll: () => void
  historyIndex: number
  historyLength: number
  isSaving: boolean
  onSave: () => Promise<void>
  aspectRatios: { label: string; value: number | undefined }[]
  selectedAspectRatio: number | undefined
  setSelectedAspectRatio: (value: number | undefined) => void
  cropReady: boolean
  previewUrlForCrop: string
}

type InspectorTab = "info" | "edit"

interface ContentInspectorProps {
  content: {
    _id: Id<"content">
    name: string
    description?: string
    type: ContentType
    status: string
    mimeType?: string
    fileSize?: number
    dimensions?: { width: number; height: number }
    duration?: number
    thumbnailUrl?: string | null
    fileUrl?: string | null
    url?: string
    aiGenerated?: boolean
    aiSource?: string
    aiPrompt?: string
    tags?: string[]
    folder?: string
    isFavorite?: boolean
    createdAt: number
    updatedAt: number
    usageCount?: number
  } | null
  onEdit?: () => void
  onDelete?: () => void
  onDownload?: () => void
  onUpdate?: (id: Id<"content">, updates: { name?: string; description?: string; isFavorite?: boolean }) => Promise<void>
  imageEditor?: ImageEditorState
}

const typeIcons: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  link: LinkIcon,
}

const statusColors: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-blue-500/10 text-blue-600",
  ready: "bg-green-500/10 text-green-600",
  failed: "bg-red-500/10 text-red-600",
  archived: "bg-gray-500/10 text-gray-600",
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown"
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "Unknown"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Inline editable field component
function EditableField({
  label,
  value,
  onSave,
  multiline = false,
  disabled = false,
}: {
  label: string
  value: string
  onSave: (value: string) => Promise<void>
  multiline?: boolean
  disabled?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-start gap-3">
        <span className="text-muted-foreground w-20 flex-shrink-0 pt-1">{label}</span>
        <div className="flex-1 space-y-2">
          {multiline ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[60px] text-sm"
              autoFocus
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          )}
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 group">
      <span className="text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-start gap-2">
        <span className={cn("font-medium", !value && "text-muted-foreground italic")}>
          {value || "Not set"}
        </span>
        {!disabled && (
          <Button aria-label="Edit"
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function ContentInspector({
  content,
  onDelete,
  onDownload,
  onUpdate,
  imageEditor,
}: ContentInspectorProps) {
  const showImageEditor = Boolean(content?.type === "image" && content?.fileUrl && imageEditor)
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("info")

  useEffect(() => {
    if (content?._id) setInspectorTab("info")
  }, [content?._id])

  const handleUpdateName = useCallback(async (newName: string) => {
    if (content && onUpdate) {
      await onUpdate(content._id, { name: newName })
    }
  }, [content, onUpdate])

  const handleUpdateDescription = useCallback(async (newDescription: string) => {
    if (content && onUpdate) {
      await onUpdate(content._id, { description: newDescription })
    }
  }, [content, onUpdate])

  const handleToggleFavorite = useCallback(async () => {
    if (content && onUpdate) {
      await onUpdate(content._id, { isFavorite: !content.isFavorite })
    }
  }, [content, onUpdate])

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-1">No content selected</h3>
        <p className="text-sm text-muted-foreground">
          Select an item from the list to view its details
        </p>
      </div>
    )
  }

  const Icon = typeIcons[content.type]

  const editPreviewStyle = imageEditor
    ? {
        filter: `brightness(${imageEditor.changes.brightness}%) contrast(${imageEditor.changes.contrast}%) saturate(${imageEditor.changes.saturation}%)`,
        transform: `rotate(${imageEditor.changes.rotation}deg) scale(${imageEditor.changes.flipH ? -1 : 1}, ${imageEditor.changes.flipV ? -1 : 1}) scale(${imageEditor.changes.zoom})`,
        transformOrigin: "center",
      }
    : undefined

  return (
    <PanelSection label="Content details">
      <PanelSection.Items>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
        {showImageEditor ? (
          <Tabs value={inspectorTab} onValueChange={(v) => setInspectorTab(v as InspectorTab)}>
            <TabsList className="flex w-full justify-evenly">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="edit">Edit Image</TabsTrigger>
            </TabsList>

              <TabsContent value="info" className="space-y-6 mt-0">
                {/* Preview */}
              <div className="relative aspect-video rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                {content.type === "image" && (content.fileUrl || content.thumbnailUrl) ? (
                  <Image
                    src={content.fileUrl || content.thumbnailUrl || ""}
                    alt={content.name}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                ) : content.type === "video" && content.fileUrl ? (
                  <video
                    src={content.fileUrl}
                    controls
                    className="w-full h-full"
                    poster={content.thumbnailUrl || undefined}
                  />
                ) : content.type === "audio" && content.fileUrl ? (
                  <div className="flex flex-col items-center gap-4 p-4">
                    <Music className="h-16 w-16 text-muted-foreground" />
                    <audio src={content.fileUrl} controls className="w-full" />
                  </div>
                ) : (
                  <Icon className="h-16 w-16 text-muted-foreground" />
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {content.fileUrl && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={onDownload} type="button">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button aria-label="Delete" variant="outline" size="sm" onClick={onDelete} type="button">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="space-y-6 mt-0">
              {/* Live Preview */}
              <div className="relative aspect-video rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                {(() => {
                  const previewSrc =
                    imageEditor?.previewUrlForCrop ||
                    content.fileUrl ||
                    content.thumbnailUrl

                  if (!previewSrc) return null

                  return (
                    <Image
                      src={previewSrc}
                      alt={content.name}
                      fill
                      className="object-contain"
                      style={editPreviewStyle}
                      sizes="100vw"
                    />
                  )
                })()}
              </div>

              {/* Inline Image Editor */}
              {content.type === "image" && content.fileUrl && imageEditor && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Edit</h4>

                  {/* Mode Tabs */}
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={imageEditor.activeMode === "transform" ? "secondary" : "ghost"}
                      size="sm"
                      className="flex-1"
                      onClick={() => imageEditor.setActiveMode("transform")}
                    >
                      <RotateCw className="h-4 w-4 mr-1" />
                      Transform
                    </Button>
                    <Button
                      type="button"
                      variant={imageEditor.activeMode === "adjust" ? "secondary" : "ghost"}
                      size="sm"
                      className="flex-1"
                      onClick={() => imageEditor.setActiveMode("adjust")}
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-1" />
                      Adjust
                    </Button>
                    <Button
                      type="button"
                      variant={imageEditor.activeMode === "crop" ? "secondary" : "ghost"}
                      size="sm"
                      className="flex-1"
                      onClick={() => imageEditor.setActiveMode("crop")}
                    >
                      {imageEditor.cropReady ? (
                        <Crop className="h-4 w-4 mr-1" />
                      ) : (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      )}
                      Crop
                    </Button>
                    <Button
                      type="button"
                      variant={imageEditor.activeMode === "preview" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => imageEditor.setActiveMode("preview")}
                      title="Preview"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* History */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={imageEditor.undo}
                      disabled={imageEditor.historyIndex === 0}
                    >
                      <Undo className="h-4 w-4 mr-1" />
                      Undo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={imageEditor.redo}
                      disabled={imageEditor.historyIndex >= imageEditor.historyLength - 1}
                    >
                      <Redo className="h-4 w-4 mr-1" />
                      Redo
                    </Button>
                  </div>

                  {/* Mode Content */}
                  {imageEditor.activeMode === "transform" && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Rotation</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => imageEditor.rotate("ccw")}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            -90°
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => imageEditor.rotate("cw")}
                          >
                            <RotateCw className="h-4 w-4 mr-1" />
                            +90°
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Flip</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={imageEditor.changes.flipH ? "secondary" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => imageEditor.flip("h")}
                          >
                            <FlipHorizontal className="h-4 w-4 mr-1" />
                            Horizontal
                          </Button>
                          <Button
                            type="button"
                            variant={imageEditor.changes.flipV ? "secondary" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => imageEditor.flip("v")}
                          >
                            <FlipVertical className="h-4 w-4 mr-1" />
                            Vertical
                          </Button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground">Zoom</Label>
                          <span className="text-xs text-muted-foreground">{Math.round(imageEditor.changes.zoom * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
                          <Button aria-label="Zoom out"
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => imageEditor.updateChanges({ zoom: Math.max(0.25, imageEditor.changes.zoom - 0.25) })}
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <Slider
                            value={[imageEditor.changes.zoom]}
                            min={0.25}
                            max={3}
                            step={0.05}
                            onValueChange={([v]) => imageEditor.updateChanges({ zoom: v })}
                            className="flex-1"
                          />
                          <Button aria-label="Zoom in"
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => imageEditor.updateChanges({ zoom: Math.min(3, imageEditor.changes.zoom + 0.25) })}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {imageEditor.activeMode === "adjust" && (
                    <div className="space-y-4" onPointerDown={(e) => e.stopPropagation()}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground">Brightness</Label>
                          <span className="text-xs text-muted-foreground">{imageEditor.changes.brightness}%</span>
                        </div>
                        <Slider
                          value={[imageEditor.changes.brightness]}
                          min={0}
                          max={200}
                          step={1}
                          onValueChange={([v]) => imageEditor.updateChanges({ brightness: v })}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground">Contrast</Label>
                          <span className="text-xs text-muted-foreground">{imageEditor.changes.contrast}%</span>
                        </div>
                        <Slider
                          value={[imageEditor.changes.contrast]}
                          min={0}
                          max={200}
                          step={1}
                          onValueChange={([v]) => imageEditor.updateChanges({ contrast: v })}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground">Saturation</Label>
                          <span className="text-xs text-muted-foreground">{imageEditor.changes.saturation}%</span>
                        </div>
                        <Slider
                          value={[imageEditor.changes.saturation]}
                          min={0}
                          max={200}
                          step={1}
                          onValueChange={([v]) => imageEditor.updateChanges({ saturation: v })}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => imageEditor.updateChanges({ brightness: 100, contrast: 100, saturation: 100 })}
                      >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Reset Adjustments
                      </Button>
                    </div>
                  )}

                  {imageEditor.activeMode === "crop" && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Aspect Ratio</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {imageEditor.aspectRatios.map((ratio) => (
                            <Button
                              type="button"
                              key={ratio.label}
                              variant={imageEditor.selectedAspectRatio === ratio.value ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => imageEditor.setSelectedAspectRatio(ratio.value)}
                            >
                              {ratio.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {imageEditor.cropReady ? (
                          <>
                            <ImageCropReset asChild>
                              <Button type="button" variant="outline" size="sm" className="flex-1">
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Reset
                              </Button>
                            </ImageCropReset>
                            <ImageCropApply asChild>
                              <Button type="button" variant="default" size="sm" className="flex-1">
                                <Crop className="h-4 w-4 mr-1" />
                                Apply Crop
                              </Button>
                            </ImageCropApply>
                          </>
                        ) : (
                          <>
                            <Button type="button" variant="outline" size="sm" className="flex-1" disabled>
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Reset
                            </Button>
                            <Button type="button" variant="default" size="sm" className="flex-1" disabled>
                              <Crop className="h-4 w-4 mr-1" />
                              Apply Crop
                            </Button>
                          </>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Drag to select the crop area</p>
                        <p>• Drag corners to resize</p>
                      </div>
                    </div>
                  )}

                  {imageEditor.activeMode === "preview" && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Center preview reflects your edits.</p>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={imageEditor.resetAll}
                  >
                    Reset All
                  </Button>

                  <Button aria-label="Confirm"
                    type="button"
                    onClick={imageEditor.onSave}
                    disabled={imageEditor.isSaving || imageEditor.activeMode === "crop"}
                    className="w-full"
                  >
                    {imageEditor.isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {/* Preview */}
            <div className="relative aspect-video rounded-lg bg-muted overflow-hidden flex items-center justify-center">
              {content.type === "image" && (content.fileUrl || content.thumbnailUrl) ? (
                <Image
                  src={content.fileUrl || content.thumbnailUrl || ""}
                  alt={content.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              ) : content.type === "video" && content.fileUrl ? (
                <video
                  src={content.fileUrl}
                  controls
                  className="w-full h-full"
                  poster={content.thumbnailUrl || undefined}
                />
              ) : content.type === "audio" && content.fileUrl ? (
                <div className="flex flex-col items-center gap-4 p-4">
                  <Music className="h-16 w-16 text-muted-foreground" />
                  <audio src={content.fileUrl} controls className="w-full" />
                </div>
              ) : (
                <Icon className="h-16 w-16 text-muted-foreground" />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {content.fileUrl && (
                <Button variant="outline" size="sm" className="flex-1" onClick={onDownload} type="button">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              <Button aria-label="Delete" variant="outline" size="sm" onClick={onDelete} type="button">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </>
        )}

        {(!showImageEditor || inspectorTab === "info") && <Separator />}

        {/* Basic Info with Inline Editing */}
        {(!showImageEditor || inspectorTab === "info") && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Details</h4>

          <div className="space-y-2 text-sm">
            <EditableField
              label="Name"
              value={content.name}
              onSave={handleUpdateName}
              disabled={!onUpdate}
            />

            <EditableField
              label="Description"
              value={content.description || ""}
              onSave={handleUpdateDescription}
              multiline
              disabled={!onUpdate}
            />

            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-20 flex-shrink-0">Type</span>
              <Badge variant="secondary" className="capitalize">
                <Icon className="h-3 w-3 mr-1" />
                {content.type}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-20 flex-shrink-0">Status</span>
              <Badge className={cn("capitalize", statusColors[content.status])}>
                {content.status}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-20 flex-shrink-0">Favorite</span>
              <Button
                type="button"
                variant={content.isFavorite ? "secondary" : "outline"}
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handleToggleFavorite}
                disabled={!onUpdate}
              >
                <Star className={cn("h-3.5 w-3.5", content.isFavorite && "fill-amber-400 text-amber-400")} />
                {content.isFavorite ? "Starred" : "Star"}
              </Button>
            </div>

            {content.mimeType && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">MIME Type</span>
                <span className="font-mono text-xs">{content.mimeType}</span>
              </div>
            )}

            {content.fileSize && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">Size</span>
                <span>{formatFileSize(content.fileSize)}</span>
              </div>
            )}

            {content.dimensions && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">Dimensions</span>
                <span>{content.dimensions.width} × {content.dimensions.height}</span>
              </div>
            )}

            {content.duration && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">Duration</span>
                <span>{formatDuration(content.duration)}</span>
              </div>
            )}

            {content.url && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">URL</span>
                <a
                  href={content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 truncate"
                >
                  {content.url}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>
        </div>
        )}

        {(!showImageEditor || inspectorTab === "info") && (
          <>
            {/* AI Generation Info */}
            {content.aiGenerated && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Generated
                  </h4>

                  <div className="space-y-2 text-sm">
                    {content.aiSource && (
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground w-20 flex-shrink-0">Source</span>
                        <Badge variant="outline" className="capitalize">
                          {content.aiSource.replace("-", " ")}
                        </Badge>
                      </div>
                    )}

                    {content.aiPrompt && (
                      <div className="flex items-start gap-3">
                        <span className="text-muted-foreground w-20 flex-shrink-0">Prompt</span>
                        <span className="text-xs bg-muted p-2 rounded-md">{content.aiPrompt}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Organization */}
            {(content.tags?.length || content.folder) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Organization</h4>

                  <div className="space-y-2 text-sm">
                    {content.folder && (
                      <div className="flex items-center gap-3">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span>{content.folder}</span>
                      </div>
                    )}

                    {content.tags && content.tags.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {content.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Metadata</h4>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(content.createdAt)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated</span>
                  <span>{formatDate(content.updatedAt)}</span>
                </div>

                {content.usageCount !== undefined && (
                  <div className="flex items-center gap-3">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Used in</span>
                    <span>{content.usageCount} places</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
          </div>
        </ScrollArea>
      </PanelSection.Items>
    </PanelSection>
  )
}
