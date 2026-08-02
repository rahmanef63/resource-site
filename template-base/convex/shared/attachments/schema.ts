/**
 * Attachments Schema
 * Provides file attachment functionality across all ERP modules
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Attachments
  attachments: defineTable({
    workspaceId: v.id("workspaces"),

    // File reference
    fileId: v.id("_storage"),

    // Entity reference
    entityType: v.string(), // e.g., "invoices", "tasks", "projects"
    entityId: v.id("_table"),

    // File information
    name: v.string(),
    originalName: v.string(),
    description: v.optional(v.string()),
    mimeType: v.string(),
    size: v.number(),

    // File metadata
    extension: v.string(),
    category: v.union(
      v.literal("image"),
      v.literal("document"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("archive"),
      v.literal("spreadsheet"),
      v.literal("presentation"),
      v.literal("pdf"),
      v.literal("other")
    ),

    // Dimensions for images/videos
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()), // in seconds for videos/audio

    // Preview/thumbnail
    thumbnailId: v.optional(v.id("_storage")),
    previewId: v.optional(v.id("_storage")),

    // Access control
    isPublic: v.boolean(),
    accessList: v.array(v.id("users")),

    // Tags and metadata
    tags: v.array(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),

    // Versioning
    version: v.number(),
    parentVersionId: v.optional(v.id("attachments")),

    // Status
    isArchived: v.boolean(),
    isDeleted: v.boolean(),

    // Statistics
    downloadCount: v.number(),
    viewCount: v.number(),

    // Audit
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.optional(v.number()),
    updatedBy: v.optional(v.id("users")),
  }),

  // Attachment collections/folders
  attachmentCollections: defineTable({
    workspaceId: v.id("workspaces"),

    // Collection info
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),

    // Hierarchy
    parentId: v.optional(v.id("attachmentCollections")),
    path: v.string(), // e.g., "/Invoices/2024/Q1"

    // Permissions
    isPublic: v.boolean(),
    allowedUsers: v.array(v.id("users")),
    allowedRoles: v.array(v.string()),

    // Settings
    maxSize: v.optional(v.number()), // Max file size in bytes
    allowedTypes: v.optional(v.array(v.string())),

    // Statistics
    fileCount: v.number(),
    totalSize: v.number(),

    // Metadata
    tags: v.array(v.string()),

    // Audit
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  }),

  // Attachment sharing
  attachmentShares: defineTable({
    workspaceId: v.id("workspaces"),

    // Shared attachment
    attachmentId: v.id("attachments"),

    // Share details
    shareId: v.string(), // Unique public ID
    shareType: v.union(
      v.literal("public"),
      v.literal("password"),
      v.literal("users"),
      v.literal("email")
    ),

    // Access control
    allowedUsers: v.array(v.id("users")),
    allowedEmails: v.array(v.string()),
    password: v.optional(v.string()),

    // Permissions
    canDownload: v.boolean(),
    canView: v.boolean(),
    canComment: v.boolean(),
    canUpload: v.boolean(),

    // Expiration
    expiresAt: v.optional(v.number()),

    // Statistics
    accessCount: v.number(),
    downloadCount: v.number(),
    lastAccessedAt: v.optional(v.number()),

    // Created by
    createdBy: v.id("users"),
    createdAt: v.number(),
  }),

  // Attachment analytics
  attachmentAnalytics: defineTable({
    workspaceId: v.id("workspaces"),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    date: v.number(),

    // Storage metrics
    totalFiles: v.number(),
    totalSize: v.number(),
    avgFileSize: v.number(),

    // Type breakdown
    filesByType: v.array(v.object({
      type: v.string(),
      count: v.number(),
      size: v.number(),
    })),

    // Activity metrics
    uploads: v.number(),
    downloads: v.number(),
    views: v.number(),
    shares: v.number(),

    // Top entities
    topEntities: v.array(v.object({
      entityType: v.string(),
      entityId: v.id("_table"),
      count: v.number(),
    })),

    // Top users
    topUploaders: v.array(v.object({
      userId: v.id("users"),
      count: v.number(),
      size: v.number(),
    })),

    createdAt: v.number(),
  }),
});
