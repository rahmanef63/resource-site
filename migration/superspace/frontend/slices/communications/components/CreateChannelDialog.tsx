/**
 * Create Channel Dialog
 * 
 * Modal dialog for creating new channels.
 * 
 * @module features/communications/components/CreateChannelDialog
 */

"use client"

import * as React from "react"
import { Hash, Volume2, Video, Lock, Globe } from "lucide-react"

// UI Components
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

// Store
import { useCommunicationsStore, useCategories } from "../shared"
import type { Channel } from "../shared/types"

// Backend hook for mutations
import { useChannelMutations } from "../hooks/useChannels"
import { useCommunicationWorkspace } from "../hooks/useCommunicationWorkspace"

import type { Id } from "@/convex/_generated/dataModel"

interface CreateChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategoryId?: string
}

const CHANNEL_TYPES = [
  { value: "text", label: "Text Channel", icon: Hash, description: "Send messages, images, GIFs, and more" },
  { value: "voice", label: "Voice Channel", icon: Volume2, description: "Hang out together with voice" },
  { value: "video", label: "Video Channel", icon: Video, description: "Video calls with screen sharing" },
]

export function CreateChannelDialog({
  open,
  onOpenChange,
  defaultCategoryId,
}: CreateChannelDialogProps) {
  const categories = useCategories()
  const selectChannel = useCommunicationsStore(state => state.selectChannel)
  const setViewMode = useCommunicationsStore(state => state.setViewMode)

  // Backend mutation
  const { createChannel } = useChannelMutations()
  
  // Active communications workspace
  const { activeWorkspaceId } = useCommunicationWorkspace()

  const [name, setName] = React.useState("")
  const [topic, setTopic] = React.useState("")
  const [type, setType] = React.useState<"text" | "voice" | "video">("text")
  const [categoryId, setCategoryId] = React.useState(defaultCategoryId || "")
  const [isPrivate, setIsPrivate] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setName("")
      setTopic("")
      setType("text")
      setCategoryId(defaultCategoryId || categories[0]?.id || "")
      setIsPrivate(false)
      setError(null)
    }
  }, [open, defaultCategoryId, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (!activeWorkspaceId) {
      setError("No workspace selected")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Call backend to create channel
      const channelId = await createChannel({
        workspaceId: activeWorkspaceId as Id<"workspaces">,
        name: name.toLowerCase().replace(/\s+/g, "-"),
        description: topic || undefined,
        isPrivate,
      })

      if (channelId) {
        // Select the newly created channel
        selectChannel(String(channelId))
        setViewMode("channel")
      }

      onOpenChange(false)
    } catch (err) {
      console.error("Failed to create channel:", err)
      setError(err instanceof Error ? err.message : "Failed to create channel")
    } finally {
      setIsSubmitting(false)
    }
  }

  const TypeIcon = CHANNEL_TYPES.find(t => t.value === type)?.icon || Hash

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="md" contentClassName="sm:max-w-[500px]">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title className="flex items-center gap-2">
          <TypeIcon className="h-5 w-5" />
          Create Channel
        </ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Create a new channel to organize conversations
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <form id="create-channel-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Channel Type */}
          <div className="space-y-3">
            <Label>Channel Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {CHANNEL_TYPES.map((channelType) => {
                const Icon = channelType.icon
                return (
                  <button
                    key={channelType.value}
                    type="button"
                    onClick={() => setType(channelType.value as "text" | "voice" | "video")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors",
                      type === channelType.value
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{channelType.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name</Label>
            <div className="relative">
              <TypeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="channel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="new-channel"
                className="pl-9"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Channel names can't contain spaces. Use hyphens instead.
            </p>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="channel-topic">Topic (optional)</Label>
            <Textarea
              id="channel-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What's this channel about?"
              rows={2}
            />
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId || "none"} onValueChange={(val) => setCategoryId(val === "none" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Private Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Globe className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="space-y-0.5">
                <Label htmlFor="private-toggle" className="cursor-pointer">
                  Private Channel
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isPrivate
                    ? "Only selected members can view this channel"
                    : "Anyone in the workspace can view this channel"}
                </p>
              </div>
            </div>
            <Switch
              id="private-toggle"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </form>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="submit" form="create-channel-form" disabled={!name.trim() || isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Channel"}
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}

export default CreateChannelDialog
