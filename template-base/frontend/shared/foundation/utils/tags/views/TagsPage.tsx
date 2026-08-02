"use client"

import React, { useState } from "react"
import { 
  Tags as TagsIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Hash,
  Search,
  Palette,
  MoreHorizontal,
  Check
} from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useTags } from "../hooks/useTags"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TagsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const TAG_COLORS = [
  { name: "Gray", value: "gray", class: "bg-gray-500", light: "bg-gray-100 text-gray-700" },
  { name: "Red", value: "red", class: "bg-red-500", light: "bg-red-100 text-red-700" },
  { name: "Orange", value: "orange", class: "bg-orange-500", light: "bg-orange-100 text-orange-700" },
  { name: "Yellow", value: "yellow", class: "bg-yellow-500", light: "bg-yellow-100 text-yellow-700" },
  { name: "Green", value: "green", class: "bg-green-500", light: "bg-green-100 text-green-700" },
  { name: "Blue", value: "blue", class: "bg-blue-500", light: "bg-blue-100 text-blue-700" },
  { name: "Purple", value: "purple", class: "bg-purple-500", light: "bg-purple-100 text-purple-700" },
  { name: "Pink", value: "pink", class: "bg-pink-500", light: "bg-pink-100 text-pink-700" },
  { name: "Cyan", value: "cyan", class: "bg-cyan-500", light: "bg-cyan-100 text-cyan-700" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-500", light: "bg-indigo-100 text-indigo-700" },
]

interface TagFormData {
  name: string
  color: string
  description: string
}

const defaultFormData: TagFormData = {
  name: "",
  color: "blue",
  description: "",
}

/**
 * Tags Page Component
 * Manage tags and categories with full CRUD
 */
export default function TagsPage({ workspaceId }: TagsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { isLoading, tags, createTag, updateTag, deleteTag } = useTags(workspaceId)
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<any>(null)
  const [formData, setFormData] = useState<TagFormData>(defaultFormData)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to manage tags
          </p>
        </div>
      </div>
    )
  }

  const filteredTags = tags.filter((tag: any) =>
    tag.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getColorClass = (color: string) => {
    return TAG_COLORS.find(c => c.value === color)?.class || "bg-gray-500"
  }

  const getLightColorClass = (color: string) => {
    return TAG_COLORS.find(c => c.value === color)?.light || "bg-gray-100 text-gray-700"
  }

  const handleCreateTag = async () => {
    if (!workspaceId || !formData.name.trim()) return
    setIsProcessing(true)

    try {
      await createTag({
        workspaceId,
        name: formData.name.trim(),
        color: formData.color,
        description: formData.description || undefined,
      })

      setCreateDialogOpen(false)
      setFormData(defaultFormData)
    } catch (error) {
      console.error("Failed to create tag:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateTag = async () => {
    if (!workspaceId || !selectedTag || !formData.name.trim()) return
    setIsProcessing(true)

    try {
      await updateTag({
        workspaceId,
        tagId: selectedTag._id,
        name: formData.name.trim(),
        color: formData.color,
        description: formData.description || undefined,
      })

      setEditDialogOpen(false)
      setSelectedTag(null)
      setFormData(defaultFormData)
    } catch (error) {
      console.error("Failed to update tag:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteTag = async () => {
    if (!workspaceId || !selectedTag) return
    setIsProcessing(true)

    try {
      await deleteTag({ workspaceId, tagId: selectedTag._id })
      setDeleteDialogOpen(false)
      setSelectedTag(null)
    } catch (error) {
      console.error("Failed to delete tag:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const openEditDialog = (tag: any) => {
    setSelectedTag(tag)
    setFormData({
      name: tag.name || "",
      color: tag.color || "blue",
      description: tag.description || "",
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (tag: any) => {
    setSelectedTag(tag)
    setDeleteDialogOpen(true)
  }

  // Group tags by color for visual organization
  const tagsByColor = filteredTags.reduce((acc: any, tag: any) => {
    const color = tag.color || "gray"
    if (!acc[color]) acc[color] = []
    acc[color].push(tag)
    return acc
  }, {})

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={TagsIcon}
        title="Tags"
        subtitle={`${tags.length} tags`}
        primaryAction={{
          label: "Create Tag",
          icon: Plus,
          onClick: () => {
            setFormData(defaultFormData)
            setCreateDialogOpen(true)
          }
        }}
      />

      {/* Search */}
      <div className="border-b p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tags List */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading tags...</p>
          </div>
        ) : filteredTags.length === 0 ? (
          <Card>
            <CardContent className="flex h-[300px] flex-col items-center justify-center gap-4">
              <TagsIcon className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="font-medium">No tags found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search" : "Create your first tag to organize items"}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tag
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* All Tags Grid */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTags.map((tag: any) => (
                <Card 
                  key={tag._id} 
                  className="group hover:shadow-md transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`h-8 w-8 rounded-lg flex items-center justify-center ${getColorClass(tag.color)} text-white`}
                        >
                          <Hash className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{tag.name}</h4>
                          {tag.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {tag.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => openDeleteDialog(tag)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <Badge className={getLightColorClass(tag.color)}>
                        {tag.usageCount || 0} items
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tag._creationTime || tag.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Preview */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Preview</h3>
                <div className="flex flex-wrap gap-2">
                  {filteredTags.slice(0, 10).map((tag: any) => (
                    <Badge 
                      key={tag._id} 
                      className={`${getLightColorClass(tag.color)} cursor-pointer`}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                  {filteredTags.length > 10 && (
                    <Badge variant="outline">+{filteredTags.length - 10} more</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Tag Dialog */}
      <ResponsiveDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} variant="modal" size="sm">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Create Tag</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Create a new tag to organize your items
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Tag name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`h-8 w-full rounded-md ${color.class} flex items-center justify-center transition-transform hover:scale-105 ${
                      formData.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                  >
                    {formData.color === color.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Describe what this tag is for"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Preview */}
            {formData.name && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <Badge className={getLightColorClass(formData.color)}>
                  <Hash className="h-3 w-3 mr-1" />
                  {formData.name}
                </Badge>
              </div>
            )}
          </div>
        </ResponsiveDialog.Body>

        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTag} disabled={isProcessing || !formData.name.trim()}>
            {isProcessing ? "Creating..." : "Create Tag"}
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>

      {/* Edit Tag Dialog */}
      <ResponsiveDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} variant="modal" size="sm">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Edit Tag</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Update tag details
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Tag name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`h-8 w-full rounded-md ${color.class} flex items-center justify-center transition-transform hover:scale-105 ${
                      formData.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                  >
                    {formData.color === color.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Input
                id="edit-description"
                placeholder="Describe what this tag is for"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Preview */}
            {formData.name && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <Badge className={getLightColorClass(formData.color)}>
                  <Hash className="h-3 w-3 mr-1" />
                  {formData.name}
                </Badge>
              </div>
            )}
          </div>
        </ResponsiveDialog.Body>

        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateTag} disabled={isProcessing || !formData.name.trim()}>
            {isProcessing ? "Saving..." : "Save Changes"}
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <ResponsiveDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} variant="alert" size="sm">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Delete Tag</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Are you sure you want to delete the tag &quot;{selectedTag?.name}&quot;?
            This will remove the tag from all items.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>
        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteTag} disabled={isProcessing}>
            {isProcessing ? "Deleting..." : "Delete Tag"}
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>
    </div>
  )
}
