import { defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * Generic dataset framework — workspace-scoped, schema-driven.
 *
 * Replaces the per-business hardcoded tables pattern (qsrWeeklyReports,
 * qsrPettyCash, ...) with three composable tables:
 *
 *   datasetTypes   — schema definition: which fields, what types, required?
 *   datasets       — workspace's named instance of a type (e.g. "Branch A Sales")
 *   datasetRecords — actual rows; fields stored as v.record(string, v.any())
 *                    and validated against the type's schema at write time.
 *
 * Why this shape:
 * - Any new business can define new types without code changes.
 * - rc-samata weekly Excel maps to N predefined types (sales-report,
 *   petty-cash, vendor-purchases, etc).
 * - Future businesses get their own types from the same framework.
 * - Existing qsrXxx tables remain for back-compat — datasets is the
 *   forward path; migration is opt-in per slice.
 *
 * Field types supported:
 *   string · number · currency (rendered IDR) · date (yyyy-mm-dd)
 *   boolean · enum (one-of values) · json (free-form sub-object)
 */
export const datasetsTables = {
  /**
   * Catalog of dataset templates. Workspace-scoped so each business can
   * define its own; globally-shared presets seeded via a setup mutation.
   */
  datasetTypes: defineTable({
    workspaceId: v.id("workspaces"),
    /** kebab-case unique-per-workspace identifier. */
    slug: v.string(),
    /** Human label. */
    name: v.string(),
    description: v.optional(v.string()),
    /** Loose grouping for UI navigation. */
    category: v.string(),
    /** Schema version — bump when fields change. */
    schemaVersion: v.number(),
    /** Field definitions; order = display order. */
    fields: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("string"),
          v.literal("number"),
          v.literal("currency"),
          v.literal("date"),
          v.literal("boolean"),
          v.literal("enum"),
          v.literal("json"),
        ),
        required: v.optional(v.boolean()),
        indexed: v.optional(v.boolean()),
        enumValues: v.optional(v.array(v.string())),
        description: v.optional(v.string()),
      }),
    ),
    /** Hints used when ingesting from generic POST/sync. */
    syncHints: v.optional(
      v.object({
        externalIdField: v.optional(v.string()),
        periodLabelField: v.optional(v.string()),
        businessDateField: v.optional(v.string()),
      }),
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_slug", ["workspaceId", "slug"])
    .index("by_workspace_category", ["workspaceId", "category"]),

  /**
   * A workspace's named instance of a dataset type. e.g. workspace has
   * two "weekly-sales-report" datasets — one per branch.
   */
  datasets: defineTable({
    workspaceId: v.id("workspaces"),
    typeId: v.id("datasetTypes"),
    name: v.string(),
    description: v.optional(v.string()),
    /** Optional link to a workspaceDataSources row that feeds this dataset. */
    sourceId: v.optional(v.id("workspaceDataSources")),
    /** Status of the dataset shell (not the records). */
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("archived"),
    ),
    recordCount: v.optional(v.number()),
    lastRecordAt: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_type", ["workspaceId", "typeId"])
    .index("by_source", ["sourceId"]),

  /**
   * Actual rows. Fields are stored as a v.record(string, v.any()) and
   * validated against the parent typeId's schema at write time.
   *
   * `externalId` is the idempotency key for sync — POST with the same
   * externalId twice = upsert, not duplicate.
   */
  datasetRecords: defineTable({
    workspaceId: v.id("workspaces"),
    datasetId: v.id("datasets"),
    typeId: v.id("datasetTypes"),
    /** External system's primary key for idempotent upsert. */
    externalId: v.optional(v.string()),
    /** Lifted from fields[periodLabelField] if syncHints.periodLabelField set. */
    periodLabel: v.optional(v.string()),
    /** Lifted from fields[businessDateField] for date-range queries. */
    businessDate: v.optional(v.string()),
    /** The actual row data; keys match parent typeId.fields[].key. */
    fields: v.record(v.string(), v.any()),
    /** Audit trail — who/what wrote this row. */
    source: v.union(
      v.literal("ui"),
      v.literal("etl"),
      v.literal("api"),
      v.literal("sync"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_dataset", ["datasetId"])
    .index("by_dataset_external", ["datasetId", "externalId"])
    .index("by_dataset_date", ["datasetId", "businessDate"])
    .index("by_dataset_period", ["datasetId", "periodLabel"])
    .index("by_workspace_date", ["workspaceId", "businessDate"]),

  /**
   * Ingress keys — let external systems (e.g. rc-samata UI) POST records
   * into this workspace's datasets without holding a superspace user
   * account. Stored as SHA-256 hash; only the prefix is queryable for
   * lookup. Raw key shown to the owner ONCE at creation time.
   *
   * Scope:
   *   scopeAllDatasets: true  → key works for any dataset in the workspace
   *   scopeAllDatasets: false → key restricted to scopeDatasetIds[]
   *
   * Revocation: set revokedAt; lookup ignores revoked rows.
   */
  /**
   * Field mapping from a source shape to a dataset's schema.
   *
   * Source systems (rc-samata UI, third-party tools) rarely emit the
   * exact field keys SuperSpace expects. A mapping stores
   * `{ sourceKey → targetFieldKey }` so ingest can transform on the
   * fly without the external system having to know about SuperSpace's
   * field names.
   *
   * Referenced by ingress requests via `mappingId` in the POST body, or
   * by syncFromRemoteDataset action via the dataset's defaultMappingId.
   */
  datasetIngestMappings: defineTable({
    workspaceId: v.id("workspaces"),
    datasetId: v.id("datasets"),
    name: v.string(),
    description: v.optional(v.string()),
    /** { sourceKey → targetFieldKey }; targetFieldKey null = skip. */
    fieldMap: v.record(v.string(), v.union(v.string(), v.null())),
    /** Stored sample for the connect-data UI to display next time. */
    sourceSample: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_dataset", ["datasetId"]),

  workspaceIngressKeys: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    /** First 8 chars of the raw key — used for fast lookup before hash verify. */
    keyPrefix: v.string(),
    /** SHA-256 hex of the raw key. */
    keyHash: v.string(),
    scopeAllDatasets: v.boolean(),
    scopeDatasetIds: v.array(v.id("datasets")),
    revokedAt: v.optional(v.number()),
    lastUsedAt: v.optional(v.number()),
    lastUsedIp: v.optional(v.string()),
    /** Counter — incremented on every successful auth, bounded by rate-limit logic. */
    useCount: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_prefix", ["keyPrefix"]),

  /**
   * Outgoing webhooks — workspace can subscribe an external URL to be
   * POSTed whenever specific dataset events fire (record create / update /
   * delete). HMAC-SHA256 signed with `secret` so the receiver can verify.
   */
  workspaceOutgoingWebhooks: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    url: v.string(),
    /** HMAC secret — random 32 bytes; revealed once at creation. */
    secret: v.string(),
    /** Subscribed events; subset of:
     *   "dataset.record.created" · "dataset.record.updated"
     *   "dataset.record.deleted" · "dataset.sync.completed"
     */
    events: v.array(v.string()),
    /** Optional: restrict to a single dataset. Empty = workspace-wide. */
    datasetId: v.optional(v.id("datasets")),
    active: v.boolean(),
    /** Tracking. */
    lastSentAt: v.optional(v.number()),
    lastStatus: v.optional(v.number()),
    lastError: v.optional(v.string()),
    totalSent: v.optional(v.number()),
    totalFailures: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_dataset", ["datasetId"]),

  /**
   * Outgoing webhook delivery log — one row per dispatch attempt.
   * 7-day retention recommended (cron prune not implemented yet).
   */
  workspaceWebhookDeliveries: defineTable({
    workspaceId: v.id("workspaces"),
    webhookId: v.id("workspaceOutgoingWebhooks"),
    event: v.string(),
    payload: v.string(),
    httpStatus: v.optional(v.number()),
    httpError: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_webhook", ["webhookId"]),
}

export default datasetsTables
