/**
 * Export/Import Configuration Template
 * Copy this file to your feature's data/ folder and customize
 */

import type { FeatureExportConfig } from "@/frontend/shared/foundation/utils/data/shared"
import type { Id } from "../../../../convex/_generated/dataModel"

// ============================================================================
// Export Properties Configuration
// ============================================================================

/**
 * Define the properties that can be exported/imported for this feature
 * Each property represents a field in your data model
 */
const exportProperties = [
  {
    // Primary identifier
    key: "_id",
    label: "ID",
    type: "string" as const,
    required: false, // Often generated on import
    description: "Unique identifier (auto-generated if empty)",
  },

  // Add your feature-specific properties here
  {
    key: "name",
    label: "Name",
    type: "string" as const,
    required: true,
    description: "Display name for the item",
  },

  {
    key: "description",
    label: "Description",
    type: "string" as const,
    required: false,
    description: "Detailed description",
  },

  {
    key: "status",
    label: "Status",
    type: "select" as const,
    required: true,
    options: ["active", "inactive", "pending", "archived"],
    description: "Current status",
  },

  {
    key: "priority",
    label: "Priority",
    type: "select" as const,
    required: false,
    options: ["low", "medium", "high", "urgent"],
    description: "Priority level",
  },

  {
    key: "createdBy",
    label: "Created By",
    type: "string" as const,
    required: false,
    description: "User ID who created this",
  },

  {
    key: "createdAt",
    label: "Created At",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Creation timestamp",
  },

  {
    key: "updatedAt",
    label: "Updated At",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Last update timestamp",
  },

  // Add workspace ID for RBAC
  {
    key: "workspaceId",
    label: "Workspace ID",
    type: "string" as const,
    required: true,
    description: "Workspace identifier",
  },
]

// ============================================================================
// Export/Import Configuration
// ============================================================================

export const exportConfig: FeatureExportConfig = {
  // Feature identifier (must match your feature folder name)
  featureId: "YOUR_FEATURE_NAME",

  // Human-readable feature name
  featureName: "Your Feature Name",

  // Return export properties
  exportProperties: async () => exportProperties,

  // Export data function - implement your data fetching logic
  exportData: async (request) => {
    // TODO: Implement your export logic

    // Example implementation:
    // const { data, isLoading } = useQuery(api.yourFeature.list, {
    //   workspaceId: request.workspaceId,
    //   limit: request.limit || 1000,
    //   filters: request.filters,
    //   sortBy: request.sortBy,
    //   sortOrder: request.sortOrder,
    // })

    // Filter based on request type
    let data: Array<Record<string, unknown>> = [] // Your data here

    if (request.dataType === "selected" && request.selectedIds) {
      data = data.filter(item => request.selectedIds!.includes(item._id as string))
    }

    // Apply filters
    if (request.filters) {
      Object.entries(request.filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          data = data.filter(item => item[field] === value)
        }
      })
    }

    // Apply sorting
    if (request.sortBy) {
      data.sort((a, b) => {
        const aVal = a[request.sortBy as string] as string | number | boolean | null | undefined
        const bVal = b[request.sortBy as string] as string | number | boolean | null | undefined

        if (request.sortOrder === "desc") {
          return (bVal ?? '') > (aVal ?? '') ? 1 : -1
        }
        return (aVal ?? '') > (bVal ?? '') ? 1 : -1
      })
    }

    return data
  },

  // Import data function - implement your import logic
  importData: async (request): Promise<any> => {
    // TODO: Implement your import logic

    // Parse the imported file
    const { parseImportFile } = await import("@/frontend/shared/foundation/utils/data/shared")
    const { data } = await parseImportFile(request.file, request.format)

    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [] as any[],
      warnings: [] as any[],
    }

    // Example import implementation:
    // const mutation = useMutation(api.yourFeature.create)

    for (const item of data) {
      try {
        // Validate required fields
        const requiredFields = exportProperties.filter(p => p.required)
        const missingFields = requiredFields.filter(p => !item[p.key])

        if (missingFields.length > 0) {
          results.failed++
          results.errors.push({
            row: data.indexOf(item) + 1,
            message: `Missing required fields: ${missingFields.map(f => f.label).join(", ")}`,
            type: "missing" as const,
          })
          continue
        }

        // Check if item already exists
        if (item._id) {
          // Update existing item
          // await mutation.mutateAsync({
          //   id: item._id,
          //   ...item,
          //   updatedAt: Date.now(),
          // })
          results.updated++
        } else {
          // Create new item
          // await mutation.mutateAsync({
          //   ...item,
          //   createdAt: Date.now(),
          //   updatedAt: Date.now(),
          // })
          results.imported++
        }
      } catch (error) {
        results.failed++
        results.errors.push({
          row: data.indexOf(item) + 1,
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

  // Template definitions for different formats
  templates: {
    json: {
      name: "JSON Template",
      description: "Template for importing data in JSON format",
      sampleData: [
        {
          name: "Example Item 1",
          description: "This is an example item",
          status: "active",
          priority: "medium",
          workspaceId: "your-workspace-id",
        },
        {
          name: "Example Item 2",
          description: "Another example",
          status: "pending",
          priority: "high",
          workspaceId: "your-workspace-id",
        },
      ],
    },
    csv: {
      name: "CSV Template",
      description: "Template for importing data in CSV format",
      sampleData: [
        {
          name: "Example Item 1",
          description: "This is an example item",
          status: "active",
          priority: "medium",
          workspaceId: "your-workspace-id",
        },
      ],
    },
  },
}

// Export for registration
export default exportConfig
