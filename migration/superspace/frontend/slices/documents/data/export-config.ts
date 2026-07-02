/**
 * Export/Import Configuration for Documents Feature
 */

import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import { parseImportFile } from "@/frontend/shared/foundation/utils/data/shared"
import type { FeatureExportConfig, ImportResult } from "@/frontend/shared/foundation/utils/data/shared"
import type { DocumentCategory } from "@/frontend/shared/documents"
import { getDocumentCategory, getCategoryTag } from "@/frontend/shared/documents"

type ExportedDocumentRow = {
  _id: string
  title: string
  content: string
  isPublic: boolean
  parentId: string | null
  workspaceId: string
  createdBy: string | null
  authorName?: string
  authorEmail?: string
  _creationTime: number
  lastModified: number | null
  lastEditedBy: string | null
  isPinned: boolean
  isStarred: boolean
  category: DocumentCategory
  tags: string[]
  description?: string
  version?: number
}

// ============================================================================
// Export Properties Configuration
// ============================================================================

const exportProperties = [
  {
    key: "_id",
    label: "Document ID",
    type: "string" as const,
    required: false,
    description: "Unique identifier (auto-generated if empty)",
  },
  {
    key: "title",
    label: "Title",
    type: "string" as const,
    required: true,
    description: "Document title",
  },
  {
    key: "content",
    label: "Content",
    type: "string" as const,
    required: false,
    description: "Document content (supports HTML, Markdown, or plain text)",
  },
  {
    key: "isPublic",
    label: "Is Public",
    type: "boolean" as const,
    required: false,
    description: "Whether document is publicly accessible",
  },
  {
    key: "parentId",
    label: "Parent ID",
    type: "string" as const,
    required: false,
    description: "Parent document ID for hierarchical structure",
  },
  {
    key: "workspaceId",
    label: "Workspace ID",
    type: "string" as const,
    required: false,
    description: "Workspace identifier",
  },
  {
    key: "createdBy",
    label: "Created By",
    type: "string" as const,
    required: false,
    description: "User ID who created the document",
  },
  {
    key: "authorName",
    label: "Author Name",
    type: "string" as const,
    required: false,
    description: "Display name of author",
  },
  {
    key: "authorEmail",
    label: "Author Email",
    type: "string" as const,
    required: false,
    description: "Email of author",
  },
  {
    key: "_creationTime",
    label: "Created At",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Creation timestamp",
  },
  {
    key: "lastModified",
    label: "Last Modified",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Last modification timestamp",
  },
  {
    key: "lastEditedBy",
    label: "Last Edited By",
    type: "string" as const,
    required: false,
    description: "User ID who last edited the document",
  },
  {
    key: "isPinned",
    label: "Is Pinned",
    type: "boolean" as const,
    required: false,
    description: "Whether document is pinned",
  },
  {
    key: "isStarred",
    label: "Is Starred",
    type: "boolean" as const,
    required: false,
    description: "Whether document is starred",
  },
  {
    key: "category",
    label: "Category",
    type: "select" as const,
    required: false,
    options: ["document", "article"],
    description: "Document category (document or article)",
  },
  {
    key: "tags",
    label: "Tags",
    type: "multiselect" as const,
    required: false,
    options: ["important", "draft", "review", "approved", "archived", "template", "reference"],
    description: "Document tags for organization",
  },
  {
    key: "description",
    label: "Description",
    type: "string" as const,
    required: false,
    description: "Document description or summary",
  },
  {
    key: "version",
    label: "Version",
    type: "number" as const,
    required: false,
    description: "Document version number",
  },
]

// ============================================================================
// Export/Import Configuration
// ============================================================================

export const exportConfig: FeatureExportConfig = {
  featureId: "knowledge/docs",
  featureName: "Documents",

  exportProperties: async () => exportProperties,

  recommendedFields: [
    "title",
    "content",
    "description",
    "tags",
    "isPublic",
    "category",
    "version",
    "lastModified",
    "_creationTime",
  ],

  // Export data function
  exportData: async (request) => {
    if (!request.workspaceId) return []
    if (!request.convex?.query) {
      throw new Error("Convex client not available for export")
    }

    const rawDocuments = (await request.convex.query(
      api["features/docs/documents"].getWorkspaceDocuments,
      { workspaceId: request.workspaceId as any }
    )) as any[] | null | undefined

    const transformedDocuments: ExportedDocumentRow[] = (rawDocuments ?? []).map((doc) => {
      const rawTags: string[] = doc.metadata?.tags ?? []
      const category = getDocumentCategory(rawTags)
      const tags = rawTags.filter((tag) => !tag.startsWith("__category:"))

      return {
        _id: String(doc._id),
        title: doc.title,
        content: doc.content ?? "",
        isPublic: Boolean(doc.isPublic),
        parentId: doc.parentId ? String(doc.parentId) : null,
        workspaceId: String(doc.workspaceId),
        createdBy: doc.createdBy ? String(doc.createdBy) : null,
        authorName: doc.author?.name ?? undefined,
        authorEmail: undefined,
        _creationTime: doc._creationTime,
        lastModified: doc.lastModified ?? null,
        lastEditedBy: doc.metadata?.lastEditedBy ? String(doc.metadata.lastEditedBy) : null,
        isPinned: Boolean(doc.isPinned ?? false),
        isStarred: Boolean(doc.isStarred ?? false),
        category,
        tags,
        description: doc.metadata?.description,
        version: doc.metadata?.version,
      }
    })

    let filteredDocuments: ExportedDocumentRow[] = transformedDocuments

    if (request.dataType === "selected" && request.selectedIds?.length) {
      const selected = new Set(request.selectedIds.map(String))
      filteredDocuments = filteredDocuments.filter((doc) => selected.has(String(doc._id)))
    }

    if (request.filters) {
      Object.entries(request.filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          if (field === "category") {
            filteredDocuments = filteredDocuments.filter((doc) => doc.category === value)
          } else if (field === "isPublic") {
            filteredDocuments = filteredDocuments.filter((doc) => doc.isPublic === Boolean(value))
          } else {
            filteredDocuments = filteredDocuments.filter((doc) => (doc as any)[field] === value)
          }
        }
      })
    }

    if (request.sortBy) {
      filteredDocuments = [...filteredDocuments].sort((a: any, b: any) => {
        let aValue: any
        let bValue: any

        switch (request.sortBy) {
          case "created":
            aValue = a._creationTime
            bValue = b._creationTime
            break
          case "modified":
            aValue = a.lastModified || a._creationTime
            bValue = b.lastModified || b._creationTime
            break
          case "name":
            aValue = a.title
            bValue = b.title
            break
          default:
            aValue = a[request.sortBy as keyof typeof a]
            bValue = b[request.sortBy as keyof typeof b]
        }

        if (request.sortOrder === "desc") {
          return bValue > aValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })
    }

    return filteredDocuments
  },

  // Import data function
  importData: async (request): Promise<ImportResult> => {
    if (!request.workspaceId) {
      throw new Error("workspaceId is required for import")
    }
    if (!request.convex?.mutation) {
      throw new Error("Convex client not available for import")
    }

    const applyFieldMapping = (row: any): any => {
      const mapping = request.options?.fieldMapping
      if (!mapping || Object.keys(mapping).length === 0) return row

      const mapped: Record<string, any> = { ...row }
      for (const [header, key] of Object.entries(mapping)) {
        if (row?.[header] !== undefined && mapped[key] === undefined) {
          mapped[key] = row[header]
        }
      }
      return mapped
    }

    const parseBoolean = (value: any, fallback = false) => {
      if (value === null || value === undefined || value === "") return fallback
      if (typeof value === "boolean") return value
      const raw = String(value).trim().toLowerCase()
      if (!raw) return fallback
      return ["true", "1", "yes", "y"].includes(raw)
    }

    const parseTags = (value: any): string[] => {
      if (value === null || value === undefined || value === "") return []
      if (Array.isArray(value)) return value.map(String).map((t) => t.trim()).filter(Boolean)
      return String(value)
        .split(/[;,|]/)
        .map((t) => t.trim())
        .filter(Boolean)
    }

    const { data } = await parseImportFile(request.file, request.format)

    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [] as any[],
      warnings: [] as any[],
    }

    for (let index = 0; index < data.length; index++) {
      const rowNumber = index + 1
      const item = applyFieldMapping(data[index])

      try {
        // Validate required fields
        const title = String(item.title ?? "").trim()
        if (!title) {
          results.failed++
          results.errors.push({
            row: rowNumber,
            message: "Missing required field: title",
            type: "missing" as const,
          })
          continue
        }

        // Validate category
        const validCategories = ["document", "article"]
        const category = item.category ? String(item.category).trim().toLowerCase() : ""
        if (category && !validCategories.includes(category)) {
          results.failed++
          results.errors.push({
            row: rowNumber,
            message: `Invalid category: ${item.category}. Must be one of: ${validCategories.join(", ")}`,
            type: "validation" as const,
          })
          continue
        }

        // Process tags and category
        const tags = parseTags(item.tags)
        const categoryProvided = Boolean(category)
        const effectiveCategory = (categoryProvided ? (category as DocumentCategory) : getDocumentCategory(tags)) || "document"
        const categoryTag = getCategoryTag(effectiveCategory)
        const tagsWithoutCategory = tags.filter((t) => !t.startsWith("__category:"))
        const tagsProvided = tagsWithoutCategory.length > 0
        const tagsWithCategory = Array.from(new Set([...tagsWithoutCategory, categoryTag]))

        // Prepare metadata
        const descriptionRaw = item.description === null || item.description === undefined ? "" : String(item.description)
        const description = descriptionRaw.trim()
        const descriptionProvided = description.length > 0
        const hasMetadataFields = descriptionProvided || tagsProvided || categoryProvided

        const metadata: any = {}
        if (descriptionProvided) metadata.description = description
        // Always ensure imported docs have a category tag on create (even if tags/category omitted).
        metadata.tags = tagsWithCategory

        // Check if document already exists
        const wantsUpdate = Boolean(request.options?.updateExisting)
        const wantsCreate = Boolean(request.options?.createMissing ?? true)
        const docId = item._id ? String(item._id).trim() : ""

        const rawIsPublic = item.isPublic
        const isPublicProvided =
          rawIsPublic !== undefined && rawIsPublic !== null && String(rawIsPublic).trim() !== ""
        const isPublic = parseBoolean(rawIsPublic, false)

        const contentRaw = item.content === null || item.content === undefined ? "" : String(item.content)
        const content = contentRaw
        const contentProvided = contentRaw.trim().length > 0

        const parentIdRaw =
          item.parentId === null || item.parentId === undefined ? "" : String(item.parentId).trim()
        const parentIdProvided = parentIdRaw.length > 0
        const parentId = parentIdProvided ? parentIdRaw : null

        if (docId && wantsUpdate) {
          const updateArgs: any = {
            id: docId as any,
            title,
          }
          if (isPublicProvided) updateArgs.isPublic = isPublic
          if (contentProvided) updateArgs.content = content
          if (parentIdProvided) updateArgs.parentId = parentId as any

          await request.convex.mutation(api["features/docs/documents"].update, updateArgs)
          results.updated++
          if (hasMetadataFields) {
            results.warnings.push({
              row: rowNumber,
              message: "Updated title/content/visibility. Tags/description are only applied on create for now.",
              type: "format" as const,
            })
          }
          continue
        }

        if (!wantsCreate) {
          results.warnings.push({
            row: rowNumber,
            message: "Skipped (createMissing is disabled)",
            type: "format" as const,
          })
          continue
        }

        const createArgs: any = {
          title,
          isPublic,
          workspaceId: request.workspaceId as any,
        }
        if (contentProvided) createArgs.content = content
        if (parentIdProvided) createArgs.parentId = parentId as any
        if (metadata.description || metadata.tags) createArgs.metadata = metadata

        await request.convex.mutation(api["features/docs/documents"].create, createArgs)
          results.imported++
      } catch (error) {
        results.failed++
        results.errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : "Unknown error",
          type: "validation" as const,
        })
      }
    }

    return {
      success: results.failed === 0,
      ...results,
    }
  },

  // Template definitions
  templates: {
    json: {
      name: "Documents JSON Template",
      description: "Template for importing documents in JSON format",
      sampleData: [
        {
          title: "Welcome Document",
          content: "# Welcome\n\nThis is a sample document content.\n\n## Features\n- Supports Markdown\n- Hierarchical structure\n- Tags and categories",
          isPublic: false,
          category: "document",
          tags: ["welcome", "template"],
          description: "Welcome document template",
          workspaceId: "your-workspace-id",
          createdBy: "your-user-id",
          authorName: "Your Name",
          authorEmail: "your@email.com",
          version: 1,
        },
        {
          title: "Knowledge Base Article",
          content: "# Article Title\n\nThis article demonstrates the knowledge base format.\n\n## Sections\nAdd your content here...",
          isPublic: true,
          category: "article",
          tags: ["knowledge-base", "article"],
          description: "Knowledge base article template",
          workspaceId: "your-workspace-id",
          createdBy: "your-user-id",
          authorName: "Your Name",
          authorEmail: "your@email.com",
          isPinned: true,
          version: 1,
        },
      ],
    },
    csv: {
      name: "Documents CSV Template",
      description: "Template for importing documents in CSV format",
      sampleData: [
        {
          title: "Sample Document",
          content: "This is a sample document content. Can include HTML or Markdown.",
          isPublic: "true",
          category: "document",
          tags: "sample",
          description: "A sample document for testing",
          workspaceId: "your-workspace-id",
          createdBy: "your-user-id",
          authorName: "Your Name",
          version: "1",
        },
      ],
    },
  },
}

// Export for registration
export default exportConfig
