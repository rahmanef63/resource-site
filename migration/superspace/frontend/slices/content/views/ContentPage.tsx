"use client"

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react"
import NextImage from "next/image"
import {
  Library,
  Upload,
  Sparkles,
  Grid,
  List,
  Archive,
  Trash2,
  FolderInput,
  Tags,
  Star,
  CheckSquare,
  Search,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link as LinkIcon,
  Info,
  Bot,
} from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContentLibrary, type ContentType } from "../hooks/useContentLibrary"
import { ContentList } from "../components/ContentList"
import { ContentInspector } from "../components/ContentInspector"
import { ContentAIChat } from "../components/ContentAIChat"
import { FolderManager } from "../components/FolderManager"
import { ContentFiltersBar } from "../components/ContentFilters"
import { UploadDialog } from "@/frontend/shared/ui/components/upload"
import { ImageCrop, ImageCropContent } from "@/components/ui/shadcn-io/image-crop"
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom"
import { Input } from "@/components/ui/input"

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

const defaultChanges: ImageEditChanges = {
  rotation: 0,
  flipH: false,
  flipV: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  zoom: 1,
}

const defaultAspectRatios = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:2", value: 3 / 2 },
  { label: "2:3", value: 2 / 3 },
]

interface ContentPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const typeFilters: { value: ContentType | "all"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "all", label: "All", icon: Library },
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "video", label: "Videos", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
  { value: "document", label: "Docs", icon: FileText },
  { value: "link", label: "Links", icon: LinkIcon },
]

/**
 * Content Library Page
 * 
 * Centralized content management for images, videos, audio, and documents
 * with AI generation capabilities.
 */
export default function ContentPage({ workspaceId }: ContentPageProps) {
  // View state
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [searchValue, setSearchValue] = useState("")
  const [activeTypeFilter, setActiveTypeFilter] = useState<ContentType | "all">("all")
  const [rightPanelMode, setRightPanelMode] = useState<"inspector" | "ai">("inspector")
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [bulkFolderTarget, setBulkFolderTarget] = useState<string>("__none__")
  const [bulkTagInput, setBulkTagInput] = useState("")

  // Inline image editor state (desktop)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [changes, setChanges] = useState<ImageEditChanges>(defaultChanges)
  const [history, setHistory] = useState<ImageEditChanges[]>([defaultChanges])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isSavingImage, setIsSavingImage] = useState(false)
  const [activeMode, setActiveMode] = useState<EditorMode>("transform")
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | undefined>(undefined)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [croppedImageSrc, setCroppedImageSrc] = useState<string | null>(null)

  // Keep latest edit changes available to stable callbacks (avoid effect churn)
  const changesRef = useRef<ImageEditChanges>(changes)

  // Keep history state in refs so rapid updates don't use stale closures
  const historyRef = useRef<ImageEditChanges[]>(history)
  const historyIndexRef = useRef<number>(historyIndex)

  useEffect(() => {
    changesRef.current = changes
  }, [changes])

  useEffect(() => {
    historyRef.current = history
  }, [history])

  useEffect(() => {
    historyIndexRef.current = historyIndex
  }, [historyIndex])

  const {
    items,
    selectedContent,
    stats,
    folders,
    availableTags,
    isLoading,
    filters,
    selectedId,
    selectedIds,
    selectionMode,
    updateFilters,
    clearFilters,
    selectItem,
    clearSelectedItem,
    toggleSelection,
    clearSelection,
    selectMany,
    setSelectionMode,
    createContent,
    deleteContent,
    duplicateContent,
    bulkDelete,
    bulkUpdateSelected,
    createAiJob,
    generateUploadUrl,
    uploadFile,
    uploadUrl,
    updateContent,
    replaceContentFile,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useContentLibrary(workspaceId)

  const visibleItems = useMemo(() => {
    return selectedFolder ? items.filter((item) => item.folder === selectedFolder) : items
  }, [items, selectedFolder])

  const renderCanvas = useCallback((overrideChanges?: ImageEditChanges) => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imgWidth = img.naturalWidth || img.width
    const imgHeight = img.naturalHeight || img.height

    const effectiveChanges = overrideChanges ?? changesRef.current

    const isRotated = effectiveChanges.rotation === 90 || effectiveChanges.rotation === 270
    const sourceWidth = isRotated ? imgHeight : imgWidth
    const sourceHeight = isRotated ? imgWidth : imgHeight

    const zoom = effectiveChanges.zoom
    canvas.width = Math.max(1, Math.round(sourceWidth * zoom))
    canvas.height = Math.max(1, Math.round(sourceHeight * zoom))

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((effectiveChanges.rotation * Math.PI) / 180)
    ctx.scale(effectiveChanges.flipH ? -1 : 1, effectiveChanges.flipV ? -1 : 1)

    ctx.filter = `brightness(${effectiveChanges.brightness}%) contrast(${effectiveChanges.contrast}%) saturate(${effectiveChanges.saturation}%)`

    const drawWidth = imgWidth * zoom
    const drawHeight = imgHeight * zoom
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
    ctx.restore()
  }, [])

  const updateChanges = useCallback((newChanges: Partial<ImageEditChanges>) => {
    setChanges((prev) => {
      const updated = { ...prev, ...newChanges }

      const baseIndex = historyIndexRef.current
      const baseHistory = historyRef.current
      const trimmed = baseHistory.slice(0, baseIndex + 1)
      const nextHistory = [...trimmed, updated]
      const nextIndex = nextHistory.length - 1

      historyRef.current = nextHistory
      historyIndexRef.current = nextIndex
      changesRef.current = updated

      setHistory(nextHistory)
      setHistoryIndex(nextIndex)

      return updated
    })
  }, [])

  const undo = useCallback(() => {
    const idx = historyIndexRef.current
    if (idx <= 0) return

    const nextIndex = idx - 1
    const next = historyRef.current[nextIndex]
    if (!next) return

    historyIndexRef.current = nextIndex
    changesRef.current = next
    setHistoryIndex(nextIndex)
    setChanges(next)
  }, [])

  const redo = useCallback(() => {
    const idx = historyIndexRef.current
    const baseHistory = historyRef.current
    if (idx >= baseHistory.length - 1) return

    const nextIndex = idx + 1
    const next = baseHistory[nextIndex]
    if (!next) return

    historyIndexRef.current = nextIndex
    changesRef.current = next
    setHistoryIndex(nextIndex)
    setChanges(next)
  }, [])

  const resetImageEdits = useCallback(() => {
    setChanges(defaultChanges)
    setHistory([defaultChanges])
    setHistoryIndex(0)
    setCroppedImageSrc(null)
    changesRef.current = defaultChanges
    historyRef.current = [defaultChanges]
    historyIndexRef.current = 0

    const src = selectedContent?.type === "image" ? selectedContent.fileUrl : null
    if (src) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imageRef.current = img
        setImageLoaded(true)
        renderCanvas(defaultChanges)
      }
      img.src = src

      fetch(src)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "image.png", { type: blob.type || "image/png" })
          setImageFile(file)
        })
        .catch(() => {})
    }
  }, [renderCanvas, selectedContent])

  const rotate = useCallback((direction: "cw" | "ccw") => {
    const delta = direction === "cw" ? 90 : -90
    updateChanges({
      rotation: ((changes.rotation + delta) % 360 + 360) % 360,
    })
  }, [changes.rotation, updateChanges])

  const flip = useCallback((axis: "h" | "v") => {
    if (axis === "h") {
      updateChanges({ flipH: !changes.flipH })
    } else {
      updateChanges({ flipV: !changes.flipV })
    }
  }, [changes.flipH, changes.flipV, updateChanges])

  const handleCropComplete = useCallback((croppedDataUrl: string) => {
    setCroppedImageSrc(croppedDataUrl)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      setChanges(defaultChanges)
      setHistory([defaultChanges])
      setHistoryIndex(0)
      renderCanvas()
    }
    img.src = croppedDataUrl

    fetch(croppedDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "cropped-image.png", { type: "image/png" })
        setImageFile(file)
      })
      .catch(() => {})

    setActiveMode("transform")
  }, [renderCanvas])

  const getCurrentPreviewUrl = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas) {
      try {
        return canvas.toDataURL("image/png")
      } catch {
        // ignore
      }
    }
    return croppedImageSrc || selectedContent?.fileUrl || ""
  }, [croppedImageSrc, selectedContent?.fileUrl])

  // Load selected image into editor (desktop)
  useEffect(() => {
    if (!selectedContent || selectedContent.type !== "image" || !selectedContent.fileUrl) {
      imageRef.current = null
      setImageLoaded(false)
      setImageFile(null)
      setCroppedImageSrc(null)
      setChanges(defaultChanges)
      setHistory([defaultChanges])
      setHistoryIndex(0)
      setActiveMode("transform")
      setSelectedAspectRatio(undefined)
      return
    }

    const imageSrc = selectedContent.fileUrl

    setImageLoaded(false)
    setImageFile(null)
    setCroppedImageSrc(null)
    setChanges(defaultChanges)
    setHistory([defaultChanges])
    setHistoryIndex(0)
    setActiveMode("transform")
    setSelectedAspectRatio(undefined)

    const img = new Image()
    img.crossOrigin = "anonymous"

    const fetchImageAsFile = () => {
      fetch(imageSrc, { mode: "cors" })
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "image.png", { type: blob.type || "image/png" })
          setImageFile(file)
        })
        .catch(() => {
          fetch(imageSrc)
            .then((res) => res.blob())
            .then((blob) => {
              const file = new File([blob], "image.png", { type: blob.type || "image/png" })
              setImageFile(file)
            })
            .catch(() => {})
        })
    }

    const createFileFromImage = (sourceImg: HTMLImageElement) => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = sourceImg.naturalWidth || sourceImg.width
        canvas.height = sourceImg.naturalHeight || sourceImg.height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          fetchImageAsFile()
          return
        }
        ctx.drawImage(sourceImg, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "image.png", { type: "image/png" })
            setImageFile(file)
          } else {
            fetchImageAsFile()
          }
        }, "image/png")
      } catch {
        fetchImageAsFile()
      }
    }

    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      renderCanvas()
      createFileFromImage(img)
    }
    img.onerror = () => {
      fetchImageAsFile()

      const fallbackImg = new Image()
      fallbackImg.onload = () => {
        imageRef.current = fallbackImg
        setImageLoaded(true)
        renderCanvas()
      }
      fallbackImg.src = imageSrc
    }
    img.src = imageSrc

    return () => {
      imageRef.current = null
      setImageLoaded(false)
      setImageFile(null)
    }
  }, [selectedContent?._id, selectedContent?.fileUrl, renderCanvas])

  // Re-render canvas when edits change
  useEffect(() => {
    if (imageLoaded && activeMode !== "crop") {
      renderCanvas(changes)
    }
  }, [changes, imageLoaded, activeMode, renderCanvas])

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
    updateFilters({ search: value })
  }, [updateFilters])

  // Handle type filter
  const handleTypeFilter = useCallback((type: ContentType | "all") => {
    setActiveTypeFilter(type)
    updateFilters({ type: type === "all" ? undefined : type })
  }, [updateFilters])

  // Handle item select
  const handleSelectItem = useCallback((id: Id<"content">) => {
    selectItem(id)
    setRightPanelMode("inspector")
    setRightPanelCollapsed(false)
  }, [selectItem])

  // Handle delete
  const handleDelete = useCallback(async (id: Id<"content">) => {
    if (confirm("Are you sure you want to delete this content?")) {
      await deleteContent(id)
      if (selectedId === id) {
        clearSelectedItem()
        setRightPanelCollapsed(true)
      }
    }
  }, [clearSelectedItem, deleteContent, selectedId])

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) {
      await bulkDelete()
      clearSelectedItem()
      setRightPanelCollapsed(true)
    }
  }, [bulkDelete, clearSelectedItem, selectedIds.size])

  const handleDuplicate = useCallback(async (id: Id<"content">) => {
    try {
      const duplicatedId = await duplicateContent(id)
      handleSelectItem(duplicatedId)
    } catch (error) {
      console.error("Failed to duplicate content:", error)
    }
  }, [duplicateContent, handleSelectItem])

  const handleToggleFavorite = useCallback(async (id: Id<"content">, nextValue: boolean) => {
    try {
      await updateContent(id, { isFavorite: nextValue })
    } catch (error) {
      console.error("Failed to update favorite state:", error)
    }
  }, [updateContent])

  const handleSelectAllVisible = useCallback(() => {
    selectMany(visibleItems.map((item) => item._id))
  }, [selectMany, visibleItems])

  const handleBulkArchive = useCallback(async () => {
    if (selectedIds.size === 0) return
    await bulkUpdateSelected({ status: "archived" })
    clearSelection()
  }, [bulkUpdateSelected, clearSelection, selectedIds.size])

  const handleBulkMove = useCallback(async () => {
    if (selectedIds.size === 0 || bulkFolderTarget === "__none__") return
    await bulkUpdateSelected({ folder: bulkFolderTarget })
    clearSelection()
    setBulkFolderTarget("__none__")
  }, [bulkFolderTarget, bulkUpdateSelected, clearSelection, selectedIds.size])

  const handleBulkAddTag = useCallback(async () => {
    const normalized = bulkTagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (selectedIds.size === 0 || normalized.length === 0) return
    await bulkUpdateSelected({ addTags: normalized })
    clearSelection()
    setBulkTagInput("")
  }, [bulkTagInput, bulkUpdateSelected, clearSelection, selectedIds.size])

  const handleBulkClearTags = useCallback(async () => {
    if (selectedIds.size === 0) return
    await bulkUpdateSelected({ clearTags: true })
    clearSelection()
  }, [bulkUpdateSelected, clearSelection, selectedIds.size])

  // Handle AI generate
  const handleAIGenerate = useCallback(async (params: {
    source: string
    prompt: string
    type: "image" | "video" | "audio"
  }) => {
    try {
      await createAiJob({
        type: params.type,
        source: params.source as any,
        prompt: params.prompt,
      })
    } catch (error) {
      console.error("Failed to create AI job:", error)
    }
  }, [createAiJob])

  // Handle file upload - files are already uploaded to storage, just create content records
  const handleUpload = useCallback(async (files: {
    file: File
    name: string
    description?: string
    type: ContentType
    tags?: string[]
    folder?: string
    storageId: string // Already uploaded, storage ID provided
  }[]) => {
    for (const fileData of files) {
      try {
        // Create content record with the storage ID from UploadDialog
        await uploadFile({
          file: fileData.file,
          name: fileData.name,
          description: fileData.description,
          type: fileData.type,
          tags: fileData.tags,
          folder: fileData.folder,
          storageId: fileData.storageId,
        })
      } catch (error) {
        console.error("Failed to create content record:", error)
      }
    }
  }, [uploadFile])

  // Handle URL upload
  const handleUploadUrl = useCallback(async (data: {
    url: string
    name: string
    description?: string
    type: ContentType
    tags?: string[]
    folder?: string
  }) => {
    try {
      await uploadUrl(data)
    } catch (error) {
      console.error("Failed to add URL:", error)
    }
  }, [uploadUrl])

  const handleSaveEditedImage = useCallback(async () => {
    if (!selectedContent || selectedContent.type !== "image") return
    if (activeMode === "crop") return

    const canvas = canvasRef.current
    if (!canvas) return

    setIsSavingImage(true)
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to create image blob"))),
          "image/png",
          0.95
        )
      })

      const uploadUrlStr = await generateUploadUrl()
      const response = await fetch(uploadUrlStr, {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: blob,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const { storageId } = await response.json()

      await replaceContentFile(selectedContent._id, {
        storageId,
        mimeType: "image/png",
        fileSize: blob.size,
        dimensions: { width: canvas.width, height: canvas.height },
      })
    } catch (error) {
      console.error("Failed to save edited image:", error)
    } finally {
      setIsSavingImage(false)
    }
  }, [activeMode, generateUploadUrl, replaceContentFile, selectedContent])

  // No workspace
  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Content Library
          </p>
        </div>
      </PageContainer>
    )
  }

  // Stats display
  const statsDisplay = stats
    ? `${stats.total} items`
    : "Loading..."

  // ============================================================================
  // Filter Tabs (used in sidebar header)
  // ============================================================================
  const filterTabs = (
    <Tabs value={activeTypeFilter} onValueChange={(v) => handleTypeFilter(v as ContentType | "all")} className="w-full">
      <div className="overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabsList className="h-8 p-0.5 inline-flex w-max bg-transparent">
          {typeFilters.map((filter) => (
            <TabsTrigger
              key={filter.value}
              value={filter.value}
              className="h-7 px-2 text-xs whitespace-nowrap data-[state=active]:bg-background"
            >
              <filter.icon className="h-3 w-3 mr-1" />
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )

  // ============================================================================
  // Sidebar Header Actions
  // ============================================================================
  const sidebarHeaderActions = (
    <div className="flex items-center gap-1">
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => setViewMode("list")}
        title="List view"
      >
        <List className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => setViewMode("grid")}
        title="Grid view"
      >
        <Grid className="h-3.5 w-3.5" />
      </Button>
    </div>
  )

  // ============================================================================
  // Sidebar Actions (selection mode)
  // ============================================================================
  const sidebarSelectionBar = selectionMode ? (
    <div className="w-full space-y-2 rounded-md bg-muted/50 p-2">
      <div className="flex items-center gap-1 justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-7 text-xs px-2"
          >
            Cancel
          </Button>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {selectedIds.size} selected
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={handleSelectAllVisible}
            disabled={visibleItems.length === 0}
          >
            <CheckSquare className="mr-1 h-3.5 w-3.5" />
            All Visible
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7"
            disabled={selectedIds.size === 0}
            onClick={handleBulkDelete}
            title="Delete Selected"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={handleBulkArchive}
          disabled={selectedIds.size === 0}
        >
          <Archive className="mr-1 h-3.5 w-3.5" />
          Archive
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={handleBulkClearTags}
          disabled={selectedIds.size === 0}
        >
          <Tags className="mr-1 h-3.5 w-3.5" />
          Clear Tags
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <FolderInput className="h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={bulkFolderTarget === "__none__" ? "" : bulkFolderTarget}
          onChange={(event) => setBulkFolderTarget(event.target.value || "__none__")}
          placeholder="Move selected to folder..."
          className="h-8 text-xs"
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          disabled={selectedIds.size === 0 || bulkFolderTarget === "__none__"}
          onClick={handleBulkMove}
        >
          Move
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Tags className="h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={bulkTagInput}
          onChange={(event) => setBulkTagInput(event.target.value)}
          placeholder="Add tags to selected, comma separated"
          className="h-8 text-xs"
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          disabled={selectedIds.size === 0 || bulkTagInput.trim().length === 0}
          onClick={handleBulkAddTag}
        >
          Add Tags
        </Button>
      </div>
    </div>
  ) : null

  // ============================================================================
  // Sidebar Content
  // ============================================================================
  const sidebarContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Library className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-sm mb-1">No content yet</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Upload files or generate with AI
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setRightPanelMode("ai")
                setRightPanelCollapsed(false)
              }}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Generate
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <ContentFiltersBar
          filters={filters}
          onUpdateFilters={updateFilters}
          onClearFilters={() => {
            clearFilters()
            setSearchValue("")
            setActiveTypeFilter("all")
            setSelectedFolder(null)
          }}
          availableTags={availableTags ?? []}
          availableFolders={folders ?? []}
          searchValue={searchValue}
          onSearchChange={handleSearch}
        />

        {/* Folder Manager */}
        <FolderManager
          folders={folders ?? []}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onCreateFolder={async (name) => {
            await createFolder(name)
          }}
          onRenameFolder={async (oldName, newName) => {
            await renameFolder(oldName, newName)
          }}
          onDeleteFolder={async (name) => {
            await deleteFolder(name)
          }}
        />

        {/* sidebarSelectionBar moved to FeatureThreeColumnLayout.sidebarFooter (pinned bottom) */}
        {!selectionMode && (
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {statsDisplay}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setSelectionMode(true)}
            >
              Select
            </Button>
          </div>
        )}
        <ContentList
          items={visibleItems}
          selectedId={selectedId}
          onSelect={handleSelectItem}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onToggleFavorite={handleToggleFavorite}
          groupByType={viewMode === "list"}
          viewMode={viewMode}
        />
      </div>
    )
  }, [availableTags, clearFilters, createFolder, deleteFolder, filters, folders, handleDelete, handleDuplicate, handleSearch, handleSelectItem, handleToggleFavorite, isLoading, items.length, renameFolder, searchValue, selectedFolder, selectedId, selectedIds, selectionMode, setSelectionMode, statsDisplay, toggleSelection, updateFilters, viewMode, visibleItems])

  // ============================================================================
  // Main Content (Preview)
  // ============================================================================
  const mainContent = useMemo(() => {
    if (!selectedContent) {
      return (
        <div className="h-full flex items-center justify-center text-center p-6">
          <div>
            <Library className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-medium text-muted-foreground">Select content to preview</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Choose an item from the list to see details
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full flex items-center justify-center p-6 bg-muted/30">
        {selectedContent.type === "image" && selectedContent.fileUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            {activeMode === "crop" ? (
              imageFile ? (
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <ImageCropContent className="max-h-full w-auto object-contain" />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Loading image for cropping…</div>
              )
            ) : activeMode === "preview" ? (
              <ImageZoom>
                {(() => {
                  const previewUrl = getCurrentPreviewUrl()
                  if (!previewUrl) return null

                  return (
                    <NextImage
                      src={previewUrl}
                      alt={selectedContent.name}
                      width={1200}
                      height={800}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      sizes="100vw"
                    />
                  )
                })()}
              </ImageZoom>
            ) : (
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                style={{ imageRendering: "auto" }}
              />
            )}
          </div>
        ) : selectedContent.type === "video" && selectedContent.fileUrl ? (
          <video
            src={selectedContent.fileUrl}
            controls
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        ) : selectedContent.type === "audio" && selectedContent.fileUrl ? (
          <div className="text-center">
            <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center mb-4 mx-auto">
              <Music className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">{selectedContent.name}</h3>
            <audio src={selectedContent.fileUrl} controls className="w-full max-w-md" />
          </div>
        ) : (
          <div className="text-center">
            <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center mb-4 mx-auto">
              {selectedContent.type === "document" ? (
                <FileText className="h-12 w-12 text-muted-foreground" />
              ) : (
                <LinkIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-medium mb-1">{selectedContent.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedContent.description}</p>
            {selectedContent.fileUrl && (
              <Button className="mt-4" asChild>
                <a href={selectedContent.fileUrl} target="_blank" rel="noopener noreferrer">
                  Open File
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }, [activeMode, getCurrentPreviewUrl, imageFile, selectedContent])

  // Main header (shows selected item name and panel toggles)
  const mainHeader = selectedContent ? (
    <div className="flex items-center justify-between px-4 py-2 h-12 bg-muted/10">
      <span className="font-medium text-sm truncate">{selectedContent.name}</span>
      <div className="flex items-center gap-1">
        <Button
          variant={rightPanelMode === "inspector" && !rightPanelCollapsed ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            setRightPanelMode("inspector")
            setRightPanelCollapsed(false)
          }}
        >
          <Info className="h-3.5 w-3.5 mr-1" />
          Info
        </Button>
        <Button
          variant={rightPanelMode === "ai" && !rightPanelCollapsed ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            setRightPanelMode("ai")
            setRightPanelCollapsed(false)
          }}
        >
          <Bot className="h-3.5 w-3.5 mr-1" />
          AI
        </Button>
      </div>
    </div>
  ) : null

  // ============================================================================
  // Right Panel (Inspector or AI Chat)
  // ============================================================================
  const rightPanel = useMemo(() => {
    if (rightPanelMode === "ai") {
      return (
        <ContentAIChat
          onGenerate={handleAIGenerate}
          isGenerating={false}
        />
      )
    }

    if (selectedContent) {
      return (
        <ContentInspector
          content={selectedContent}
          onDelete={() => handleDelete(selectedContent._id)}
          onDownload={() => {
            if (selectedContent.fileUrl) {
              window.open(selectedContent.fileUrl, "_blank")
            }
          }}
          onUpdate={async (id, updates) => {
            await updateContent(id, updates)
          }}
          imageEditor={selectedContent.type === "image" && selectedContent.fileUrl ? {
            activeMode,
            setActiveMode,
            changes,
            updateChanges,
            rotate,
            flip,
            undo,
            redo,
            resetAll: resetImageEdits,
            historyIndex,
            historyLength: history.length,
            isSaving: isSavingImage,
            onSave: handleSaveEditedImage,
            aspectRatios: defaultAspectRatios,
            selectedAspectRatio,
            setSelectedAspectRatio,
            cropReady: Boolean(imageFile),
            previewUrlForCrop: croppedImageSrc || selectedContent.fileUrl,
          } : undefined}
        />
      )
    }

    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div>
          <Info className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Select content to view details</p>
        </div>
      </div>
    )
  }, [rightPanelMode, selectedContent, handleDelete, handleAIGenerate, updateContent, activeMode, changes, updateChanges, rotate, flip, undo, redo, resetImageEdits, historyIndex, history.length, isSavingImage, handleSaveEditedImage, selectedAspectRatio, imageFile, croppedImageSrc])

  const threeColumnLayout = (
    <FeatureThreeColumnLayout
        rightHidden={false}
      // Sidebar config
      sidebarTitle=""
      sidebarStats=""
      sidebarActions={sidebarHeaderActions}
      sidebarContent={sidebarContent}
      sidebarFooter={selectionMode ? <div className="p-2">{sidebarSelectionBar}</div> : undefined}

      // Filter tabs in sidebar header
      filterOptions={filterTabs}

      // Center
      mainContent={mainContent}
      mainHeader={mainHeader}

      // Right
      inspector={rightPanel}

      // Layout Props
      preset="feature"
      leftLabel="Library"
      centerLabel={selectedContent ? selectedContent.name : "Content Preview"}
      rightLabel={rightPanelMode === "ai" ? "AI Content Generator" : "Inspector"}
      storageKey="content-layout"
      persistState={true}
      rightCollapsed={rightPanelCollapsed}
      onRightCollapsedChange={setRightPanelCollapsed}
      rightWidth={420}
    />
  )

  const desktopLayout = selectedContent?.type === "image" && imageFile ? (
    <ImageCrop
      file={imageFile}
      aspect={selectedAspectRatio}
      onCrop={handleCropComplete}
      maxImageSize={1024 * 1024 * 10}
    >
      {threeColumnLayout}
    </ImageCrop>
  ) : (
    threeColumnLayout
  )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Feature Header - Main page header */}
      <FeatureHeader
        title="Content Library"
        icon={Library}
        meta={[{ label: "Items", value: stats?.total ?? 0 }]}
        primaryAction={{
          label: "Upload",
          icon: Upload,
          onClick: () => setUploadDialogOpen(true),
        }}
        secondaryActions={[
          <Button
            key="generate"
            variant={rightPanelMode === "ai" && !rightPanelCollapsed ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              setRightPanelMode("ai")
              setRightPanelCollapsed(false)
            }}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Generate
          </Button>
        ]}
      />

      {/* Three Column Layout */}
      <div className="flex-1 min-h-0">
        {desktopLayout}
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
        onUploadUrl={handleUploadUrl}
        generateUploadUrl={generateUploadUrl}
        folders={folders ?? []}
        availableTags={availableTags ?? []}
      />

    </div>
  )
}
