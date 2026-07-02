/**
 * Type definitions for content feature
 */

import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

export type { ContentMessageMeta, ContentGenerationType } from "./chat"

export type ContentType = "image" | "video" | "audio" | "document" | "link"
export type ContentStatus = "draft" | "processing" | "ready" | "failed" | "archived"
export type AiSource = "nano-banana" | "veo" | "eleven-labs" | "openai-dalle" | "midjourney" | "stable-diffusion" | "other"

export interface ContentItem extends Omit<BaseEntity, "id"> {
  _id: Id<"content">
  workspaceId: Id<"workspaces">
  name: string
  description?: string
  type: ContentType
  status: ContentStatus
  storageId?: Id<"_storage">
  url?: string
  thumbnailStorageId?: Id<"_storage">
  mimeType?: string
  fileSize?: number
  dimensions?: {
    width: number
    height: number
  }
  duration?: number
  aiGenerated?: boolean
  aiSource?: AiSource
  aiPrompt?: string
  aiSettings?: Record<string, unknown>
  tags?: string[]
  folder?: string
  createdBy: Id<"users">
  usageCount?: number
  // Populated URLs
  fileUrl?: string | null
  thumbnailUrl?: string | null
}

export interface ContentConfig {
  enabled: boolean
  settings?: Record<string, unknown>
}
