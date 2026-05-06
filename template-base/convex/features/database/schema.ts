import { defineTable } from "convex/server";
import { v } from "convex/values";

export const dbTables = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  coverUrl: v.optional(v.string()),
  isPublic: v.optional(v.boolean()),
  // Feature type for feature-specific databases (calendar, crm, tasks, etc.)
  featureType: v.optional(v.union(
    v.literal("calendar"),
    v.literal("crm"),
    v.literal("tasks"),
    v.literal("projects"),
    v.literal("inventory"),
  )),
  createdById: v.id("users"),
  updatedById: v.id("users"),
  isTemplate: v.boolean(),
  settings: v.object({
    showProperties: v.boolean(),
    wrapCells: v.boolean(),
    showCalculations: v.boolean(),
  }),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_feature", ["workspaceId", "featureType"]);

export const dbFields = defineTable({
  tableId: v.id("dbTables"),
  name: v.string(),
  type: v.union(
    // Core types
    v.literal("text"),
    v.literal("number"),
    v.literal("select"),
    v.literal("multiSelect"),
    v.literal("date"),
    v.literal("person"),
    v.literal("files"),
    v.literal("checkbox"),
    v.literal("url"),
    v.literal("email"),
    v.literal("phone"),
    v.literal("formula"),
    v.literal("relation"),
    v.literal("rollup"),
    // Extended types (Features #95-98, #111)
    v.literal("richText"),
    v.literal("json"),
    v.literal("media"),
    v.literal("autoId"),
    v.literal("status"),
    v.literal("createdTime"),
    v.literal("lastEditedTime"),
    v.literal("createdBy"),
    v.literal("lastEditedBy"),
  ),
  options: v.optional(
    v.object({
      selectOptions: v.optional(
        v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            color: v.string(),
          }),
        ),
      ),
      dateFormat: v.optional(v.string()),
      numberFormat: v.optional(v.string()),
      formula: v.optional(v.string()),
      // Extended options
      richTextFormat: v.optional(v.union(
        v.literal("plain"),
        v.literal("markdown"),
        v.literal("html"),
      )),
      mediaTypes: v.optional(v.array(v.string())), // ['image', 'video', 'audio']
      jsonSchema: v.optional(v.any()), // JSON schema for validation
      autoIdPrefix: v.optional(v.string()), // e.g., "TASK-"
      autoIdLength: v.optional(v.number()), // e.g., 6
    }),
  ),
  // Core field settings
  isRequired: v.boolean(),
  isPrimary: v.optional(v.boolean()),
  position: v.number(),
  // Field constraints (Features #103-110)
  isLocked: v.optional(v.boolean()), // #103 Field locking
  isUnique: v.optional(v.boolean()), // #107 Unique constraints
  isSystem: v.optional(v.boolean()), // #105 Hidden system fields
  isHidden: v.optional(v.boolean()), // #105 Hidden from UI
  isIndexed: v.optional(v.boolean()), // #108 Indexing hint
  defaultValue: v.optional(v.any()), // #110 Default values
  validationScript: v.optional(v.string()), // #109 Custom validation
  // Field-level permissions (#104)
  permissions: v.optional(v.object({
    viewRoles: v.optional(v.array(v.number())), // Role levels that can view
    editRoles: v.optional(v.array(v.number())), // Role levels that can edit
  })),
  // Audit
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
}).index("by_table", ["tableId"]);

export const dbViews = defineTable({
  tableId: v.id("dbTables"),
  name: v.string(),
  type: v.union(
    v.literal("table"),
    v.literal("board"),
    v.literal("calendar"),
    v.literal("gallery"),
    v.literal("list"),
    v.literal("timeline"),
  ),
  settings: v.object({
    filters: v.array(
      v.object({
        fieldId: v.string(),
        operator: v.union(
          v.literal("equals"),
          v.literal("contains"),
          v.literal("isEmpty"),
          v.literal("isNotEmpty"),
        ),
        value: v.optional(v.any()),
      }),
    ),
    sorts: v.array(
      v.object({
        fieldId: v.string(),
        direction: v.union(v.literal("asc"), v.literal("desc")),
      }),
    ),
    visibleFields: v.array(v.id("dbFields")),
    fieldWidths: v.optional(v.record(v.string(), v.number())),
  }),
  createdById: v.id("users"),
  isDefault: v.boolean(),
  position: v.optional(v.number()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
}).index("by_table", ["tableId"]);

export const dbRows = defineTable({
  tableId: v.id("dbTables"),
  workspaceId: v.id("workspaces"),
  data: v.record(v.string(), v.any()),
  computed: v.optional(v.record(v.string(), v.any())),
  docId: v.optional(v.id("documents")),
  createdById: v.id("users"),
  updatedById: v.id("users"),
  position: v.number(),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
})
  .index("by_table", ["tableId"])
  .index("by_doc", ["docId"]);

/**
 * Universal Database Table (v2.0)
 * Stores databases using the Universal Database specification
 * @see docs/UNIVERSAL_DATABASE_SPEC.md
 */
export const universalDatabases = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),

  // Complete Universal Database spec as JSON
  universalSpec: v.any(),

  // Version tracking
  version: v.string(),

  // Audit fields
  createdById: v.id("users"),
  updatedById: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_name", ["workspaceId", "name"]);

/**
 * Saved Views (Feature #69)
 * User-specific saved view configurations
 */
export const dbSavedViews = defineTable({
  viewId: v.id("dbViews"),
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  // Snapshot of view settings at time of save
  settings: v.object({
    filters: v.array(
      v.object({
        fieldId: v.string(),
        operator: v.string(),
        value: v.optional(v.any()),
      }),
    ),
    sorts: v.array(
      v.object({
        fieldId: v.string(),
        direction: v.union(v.literal("asc"), v.literal("desc")),
      }),
    ),
    visibleFields: v.array(v.string()),
    groupBy: v.optional(v.string()),
    fieldWidths: v.optional(v.record(v.string(), v.number())),
  }),
  isDefault: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_view", ["viewId"])
  .index("by_workspace_user", ["workspaceId", "userId"]);

/**
 * Shared Views (Feature #70)
 * View sharing permissions and access control
 */
export const dbSharedViews = defineTable({
  savedViewId: v.id("dbSavedViews"),
  workspaceId: v.id("workspaces"),
  // Who shared it
  sharedById: v.id("users"),
  // Share target: workspace-wide, specific users, or link
  shareType: v.union(
    v.literal("workspace"),
    v.literal("users"),
    v.literal("link"),
  ),
  // For "users" type: list of user IDs
  sharedWithUserIds: v.optional(v.array(v.id("users"))),
  // For "link" type: access token
  accessToken: v.optional(v.string()),
  // Permissions for shared view
  permission: v.union(
    v.literal("view"),
    v.literal("edit"),
  ),
  expiresAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_saved_view", ["savedViewId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_access_token", ["accessToken"]);

/**
 * Row Version History (Feature #78)
 * Stores snapshots of row data for versioning
 */
export const dbRowVersions = defineTable({
  rowId: v.id("dbRows"),
  tableId: v.id("dbTables"),
  workspaceId: v.id("workspaces"),
  // Version number (incrementing)
  version: v.number(),
  // Snapshot of data at this version
  data: v.record(v.string(), v.any()),
  // What changed (for efficient diffing)
  changedFields: v.array(v.string()),
  // Who made the change
  changedById: v.id("users"),
  // Change type
  changeType: v.union(
    v.literal("create"),
    v.literal("update"),
    v.literal("restore"),
  ),
  // Optional change note/comment
  note: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_row", ["rowId"])
  .index("by_row_version", ["rowId", "version"])
  .index("by_table", ["tableId"])
  .index("by_workspace", ["workspaceId"]);

/**
 * Row Change History (Feature #79)
 * Detailed audit trail per field change
 */
export const dbRowHistory = defineTable({
  rowId: v.id("dbRows"),
  tableId: v.id("dbTables"),
  workspaceId: v.id("workspaces"),
  // Which field changed
  fieldId: v.string(),
  fieldName: v.string(),
  // Before and after values
  previousValue: v.optional(v.any()),
  newValue: v.optional(v.any()),
  // Who made the change
  changedById: v.id("users"),
  // When
  changedAt: v.number(),
})
  .index("by_row", ["rowId"])
  .index("by_table", ["tableId"])
  .index("by_field", ["rowId", "fieldId"])
  .index("by_user", ["changedById"]);

/**
 * Soft Delete Trash (Feature #80, #82)
 * Stores deleted rows for restore capability
 */
export const dbDeletedRows = defineTable({
  // Original row ID
  originalRowId: v.string(),
  tableId: v.id("dbTables"),
  workspaceId: v.id("workspaces"),
  // Full row data snapshot
  data: v.record(v.string(), v.any()),
  computed: v.optional(v.record(v.string(), v.any())),
  position: v.number(),
  // Deletion metadata
  deletedById: v.id("users"),
  deletedAt: v.number(),
  // Auto-purge after X days (default 30)
  expiresAt: v.number(),
  // Restore metadata
  restoredAt: v.optional(v.number()),
  restoredById: v.optional(v.id("users")),
})
  .index("by_table", ["tableId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_expires", ["expiresAt"])
  .index("by_deleted", ["workspaceId", "deletedAt"]);

/**
 * Conditional Field Rules (Feature #85)
 * Field visibility and behavior based on conditions
 */
export const dbFieldConditions = defineTable({
  fieldId: v.id("dbFields"),
  tableId: v.id("dbTables"),
  // Condition type
  conditionType: v.union(
    v.literal("showIf"),
    v.literal("hideIf"),
    v.literal("requiredIf"),
    v.literal("readonlyIf"),
  ),
  // Condition rules (evaluated as AND)
  conditions: v.array(
    v.object({
      sourceFieldId: v.id("dbFields"),
      operator: v.union(
        v.literal("equals"),
        v.literal("notEquals"),
        v.literal("contains"),
        v.literal("isEmpty"),
        v.literal("isNotEmpty"),
        v.literal("greaterThan"),
        v.literal("lessThan"),
      ),
      value: v.optional(v.any()),
    }),
  ),
  // Priority (lower = higher priority)
  priority: v.optional(v.number()),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_field", ["fieldId"])
  .index("by_table", ["tableId"]);

/**
 * Relation Configuration (Feature #89, #90)
 * Two-way and many-to-many relation settings
 */
export const dbRelationConfigs = defineTable({
  // Source field (the relation field)
  sourceFieldId: v.id("dbFields"),
  sourceTableId: v.id("dbTables"),
  // Target table being linked to
  targetTableId: v.id("dbTables"),
  // Relation type
  relationType: v.union(
    v.literal("oneToOne"),
    v.literal("oneToMany"),
    v.literal("manyToOne"),
    v.literal("manyToMany"),
  ),
  // Two-way relation config
  isTwoWay: v.boolean(),
  // Inverse field (auto-created for two-way)
  inverseFieldId: v.optional(v.id("dbFields")),
  inverseFieldName: v.optional(v.string()),
  // For M2M: junction table
  junctionTableId: v.optional(v.id("dbTables")),
  // Cascade delete behavior
  onDelete: v.union(
    v.literal("setNull"),
    v.literal("cascade"),
    v.literal("restrict"),
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_source_field", ["sourceFieldId"])
  .index("by_source_table", ["sourceTableId"])
  .index("by_target_table", ["targetTableId"])
  .index("by_junction", ["junctionTableId"]);

/**
 * Junction Table Entries (for M2M relations)
 */
export const dbRelationJunctions = defineTable({
  relationConfigId: v.id("dbRelationConfigs"),
  sourceRowId: v.id("dbRows"),
  targetRowId: v.id("dbRows"),
  // Optional metadata for the relation
  metadata: v.optional(v.record(v.string(), v.any())),
  createdById: v.id("users"),
  createdAt: v.number(),
})
  .index("by_config", ["relationConfigId"])
  .index("by_source", ["sourceRowId"])
  .index("by_target", ["targetRowId"])
  .index("by_source_target", ["sourceRowId", "targetRowId"]);

// =============================================================================
// Database & Schema Tables (91-115)
// =============================================================================

// Table Templates (#92) - Reusable table structures
export const dbTableTemplates = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  category: v.optional(v.string()), // "CRM", "Project", "Inventory", etc.
  // Template structure
  fields: v.array(v.object({
    name: v.string(),
    type: v.string(),
    options: v.optional(v.any()),
    isRequired: v.optional(v.boolean()),
    defaultValue: v.optional(v.any()),
  })),
  defaultViews: v.optional(v.array(v.object({
    name: v.string(),
    type: v.string(),
    config: v.optional(v.any()),
  }))),
  // Sharing
  isGlobal: v.optional(v.boolean()), // Available to all workspaces
  isPublished: v.optional(v.boolean()),
  // Metadata
  usageCount: v.optional(v.number()),
  createdById: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_category", ["category"])
  .index("by_global", ["isGlobal"]);

// Schema Versions (#101) - Track schema changes over time
export const dbSchemaVersions = defineTable({
  tableId: v.id("dbTables"),
  version: v.number(),
  // Snapshot of fields at this version
  fieldsSnapshot: v.array(v.object({
    fieldId: v.string(),
    name: v.string(),
    type: v.string(),
    options: v.optional(v.any()),
    order: v.number(),
  })),
  // Change description
  changeType: v.union(
    v.literal("field_added"),
    v.literal("field_removed"),
    v.literal("field_modified"),
    v.literal("field_reordered"),
    v.literal("table_created"),
    v.literal("batch_changes"),
  ),
  changes: v.optional(v.array(v.object({
    fieldId: v.optional(v.string()),
    action: v.string(),
    before: v.optional(v.any()),
    after: v.optional(v.any()),
  }))),
  // Metadata
  createdById: v.id("users"),
  createdAt: v.number(),
  comment: v.optional(v.string()),
})
  .index("by_table", ["tableId"])
  .index("by_table_version", ["tableId", "version"]);

// Schema Migrations (#102) - Migration scripts and execution history
export const dbSchemaMigrations = defineTable({
  tableId: v.id("dbTables"),
  fromVersion: v.number(),
  toVersion: v.number(),
  // Migration definition
  migrationScript: v.optional(v.string()), // JS/TS code for data transformation
  migrationSteps: v.optional(v.array(v.object({
    type: v.union(
      v.literal("rename_field"),
      v.literal("change_type"),
      v.literal("merge_fields"),
      v.literal("split_field"),
      v.literal("compute_values"),
      v.literal("delete_field"),
    ),
    config: v.any(),
  }))),
  // Execution status
  status: v.union(
    v.literal("pending"),
    v.literal("running"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("rolled_back"),
  ),
  executedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  rowsProcessed: v.optional(v.number()),
  rowsFailed: v.optional(v.number()),
  errorLog: v.optional(v.array(v.string())),
  // Rollback support
  isReversible: v.optional(v.boolean()),
  rollbackScript: v.optional(v.string()),
  // Metadata
  createdById: v.id("users"),
  createdAt: v.number(),
})
  .index("by_table", ["tableId"])
  .index("by_status", ["status"]);

// Field Validation Rules (#109) - Custom validation beyond type constraints
export const dbFieldValidations = defineTable({
  fieldId: v.id("dbFields"),
  tableId: v.id("dbTables"),
  // Validation type
  validationType: v.union(
    v.literal("regex"),
    v.literal("range"),
    v.literal("custom_script"),
    v.literal("dependency"),
    v.literal("unique_composite"),
    v.literal("cross_field"),
  ),
  // Validation config
  config: v.object({
    pattern: v.optional(v.string()), // For regex
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    script: v.optional(v.string()), // For custom validation
    dependsOnFields: v.optional(v.array(v.id("dbFields"))),
    compositeFields: v.optional(v.array(v.id("dbFields"))), // For unique composite
    errorMessage: v.optional(v.string()),
  }),
  // Behavior
  isActive: v.boolean(),
  runOnCreate: v.optional(v.boolean()),
  runOnUpdate: v.optional(v.boolean()),
  // Metadata
  createdById: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_field", ["fieldId"])
  .index("by_table", ["tableId"]);

// Database Import/Export Jobs (#112-115) - Track import/export operations
export const dbImportExportJobs = defineTable({
  tableId: v.id("dbTables"),
  workspaceId: v.id("workspaces"),
  // Job type
  jobType: v.union(
    v.literal("import_csv"),
    v.literal("export_csv"),
    v.literal("import_json"),
    v.literal("export_json"),
    v.literal("import_excel"),
    v.literal("export_excel"),
  ),
  // Configuration
  config: v.optional(v.object({
    // Import options
    fieldMapping: v.optional(v.record(v.string(), v.string())), // source -> target field
    skipFirstRow: v.optional(v.boolean()),
    dateFormat: v.optional(v.string()),
    nullValues: v.optional(v.array(v.string())),
    updateMode: v.optional(v.union(
      v.literal("insert_only"),
      v.literal("update_only"),
      v.literal("upsert"),
    )),
    matchField: v.optional(v.id("dbFields")), // For upsert matching
    // Export options
    includeFields: v.optional(v.array(v.id("dbFields"))),
    excludeFields: v.optional(v.array(v.id("dbFields"))),
    filters: v.optional(v.any()),
    sortBy: v.optional(v.string()),
  })),
  // Status
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("cancelled"),
  ),
  // Progress
  totalRows: v.optional(v.number()),
  processedRows: v.optional(v.number()),
  successRows: v.optional(v.number()),
  failedRows: v.optional(v.number()),
  errors: v.optional(v.array(v.object({
    row: v.number(),
    field: v.optional(v.string()),
    error: v.string(),
  }))),
  // File reference
  fileId: v.optional(v.id("_storage")),
  fileName: v.optional(v.string()),
  fileSize: v.optional(v.number()),
  downloadUrl: v.optional(v.string()),
  // Metadata
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  createdById: v.id("users"),
  createdAt: v.number(),
})
  .index("by_table", ["tableId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_status", ["status"]);

// Field Indexes (#111) - Custom index configuration for performance
export const dbFieldIndexes = defineTable({
  tableId: v.id("dbTables"),
  name: v.string(),
  // Index configuration
  fields: v.array(v.object({
    fieldId: v.id("dbFields"),
    direction: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  })),
  indexType: v.union(
    v.literal("single"),
    v.literal("composite"),
    v.literal("unique"),
    v.literal("fulltext"),
  ),
  // Status
  isActive: v.boolean(),
  // Metadata
  createdById: v.id("users"),
  createdAt: v.number(),
})
  .index("by_table", ["tableId"]);

export const databaseTables = {
  dbTables,
  dbFields,
  dbViews,
  dbRows,
  universalDatabases,
  // New tables for Universal Data Engine
  dbSavedViews,
  dbSharedViews,
  dbRowVersions,
  dbRowHistory,
  dbDeletedRows,
  dbFieldConditions,
  dbRelationConfigs,
  dbRelationJunctions,
  // New tables for Database & Schema (91-115)
  dbTableTemplates,
  dbSchemaVersions,
  dbSchemaMigrations,
  dbFieldValidations,
  dbImportExportJobs,
  dbFieldIndexes,
};

export type DatabaseTables = typeof databaseTables;
