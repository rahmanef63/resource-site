/**
 * JSON Schema Definitions with Zod Validation
 * Ensures type-safe JSON import/export
 */

import { z } from "zod"

// ============================================================================
// Version & Format
// ============================================================================

export const SCHEMA_VERSION = "1.0.0"
export const SCHEMA_FORMAT = "superspace-v1"

// ============================================================================
// Base Schemas
// ============================================================================

export const NodeMetadataSchema = z.object({
  description: z.string().optional(),
  author: z.string().optional(),
  version: z.string().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  deprecated: z.boolean().optional(),
  previewImage: z.string().url().optional(),
}).optional()

export const LayoutConfigSchema = z.object({
  display: z.enum(["flex", "grid", "block", "inline-block"]).optional(),
  flexDirection: z.enum(["row", "column", "row-reverse", "column-reverse"]).optional(),
  justifyContent: z.enum(["start", "center", "end", "between", "around", "evenly"]).optional(),
  alignItems: z.enum(["start", "center", "end", "stretch", "baseline"]).optional(),
  gap: z.union([z.string(), z.number()]).optional(),
  padding: z.union([z.string(), z.number()]).optional(),
  margin: z.union([z.string(), z.number()]).optional(),
  width: z.union([z.string(), z.number()]).optional(),
  height: z.union([z.string(), z.number()]).optional(),
  gridTemplateColumns: z.string().optional(),
  gridTemplateRows: z.string().optional(),
}).optional()

export const RouteConfigSchema = z.object({
  path: z.string(),
  templateId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  meta: z.record(z.string(), z.any()).optional(),
})

// ============================================================================
// Component JSON Schema
// ============================================================================

export const ComponentJSONSchema = z.object({
  type: z.literal("component"),
  component: z.string(),
  props: z.record(z.string(), z.any()),
  children: z.any().optional(),
})

export type ComponentJSONType = z.infer<typeof ComponentJSONSchema>

// ============================================================================
// Element JSON Schema
// ============================================================================

export const ElementJSONSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal("element"),
    element: z.string(),
  props: z.record(z.string(), z.any()),
    children: z.array(
      z.union([ComponentJSONSchema, ElementJSONSchema])
    ),
  })
)

export type ElementJSONType = z.infer<typeof ElementJSONSchema>

// ============================================================================
// Block JSON Schema
// ============================================================================

export const BlockJSONSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal("block"),
    block: z.string(),
  props: z.record(z.string(), z.any()),
    children: z.array(
      z.union([ComponentJSONSchema, ElementJSONSchema, BlockJSONSchema])
    ),
  })
)

export type BlockJSONType = z.infer<typeof BlockJSONSchema>

// ============================================================================
// Section JSON Schema
// ============================================================================

export const SectionJSONSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal("section"),
    section: z.string(),
  props: z.record(z.string(), z.any()),
    children: z.array(
      z.union([
        ComponentJSONSchema,
        ElementJSONSchema,
        BlockJSONSchema,
        SectionJSONSchema,
      ])
    ),
  })
)

export type SectionJSONType = z.infer<typeof SectionJSONSchema>

// ============================================================================
// Template JSON Schema
// ============================================================================

export const TemplateJSONSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal("template"),
    template: z.string(),
  props: z.record(z.string(), z.any()),
    children: z.array(
      z.union([
        ComponentJSONSchema,
        ElementJSONSchema,
        BlockJSONSchema,
        SectionJSONSchema,
        TemplateJSONSchema,
      ])
    ),
  })
)

export type TemplateJSONType = z.infer<typeof TemplateJSONSchema>

// ============================================================================
// Flow JSON Schema
// ============================================================================

export const FlowJSONSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal("flow"),
    flow: z.string(),
  props: z.record(z.string(), z.any()),
    children: z.array(
      z.union([TemplateJSONSchema, FlowJSONSchema])
    ),
    routes: z.array(RouteConfigSchema),
  })
)

export type FlowJSONType = z.infer<typeof FlowJSONSchema>

// ============================================================================
// Group JSON Schema
// ============================================================================

export const GroupJSONSchema = z.object({
  type: z.literal("group"),
  id: z.string(),
  name: z.string(),
  children: z.array(z.string()),
  locked: z.boolean().optional(),
  collapsed: z.boolean().optional(),
  layout: z.object({
    display: z.enum(["flex", "grid", "block", "inline-block"]).optional(),
    flexDirection: z.enum(["row", "column", "row-reverse", "column-reverse"]).optional(),
    justifyContent: z.enum(["start", "center", "end", "between", "around", "evenly"]).optional(),
    alignItems: z.enum(["start", "center", "end", "stretch", "baseline"]).optional(),
    gap: z.union([z.string(), z.number()]).optional(),
    padding: z.union([z.string(), z.number()]).optional(),
    margin: z.union([z.string(), z.number()]).optional(),
    width: z.union([z.string(), z.number()]).optional(),
    height: z.union([z.string(), z.number()]).optional(),
    gridTemplateColumns: z.string().optional(),
    gridTemplateRows: z.string().optional(),
  }).optional(),
  metadata: z.object({
    description: z.string().optional(),
    author: z.string().optional(),
    version: z.string().optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    deprecated: z.boolean().optional(),
    previewImage: z.string().url().optional(),
  }).optional(),
})

export type GroupJSONType = z.infer<typeof GroupJSONSchema>

// ============================================================================
// Component Definition & Instance JSON Schemas
// ============================================================================

export const ComponentDefinitionJSONSchema = z.object({
  type: z.literal("component-definition"),
  id: z.string(),
  name: z.string(),
  children: z.array(z.string()),
  props: z.record(z.string(), z.any()),
  metadata: z.object({
    description: z.string().optional(),
    author: z.string().optional(),
    version: z.string().optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    deprecated: z.boolean().optional(),
    previewImage: z.string().url().optional(),
  }).optional(),
})

export type ComponentDefinitionJSONType = z.infer<typeof ComponentDefinitionJSONSchema>

export const ComponentInstanceJSONSchema = z.object({
  type: z.literal("component-instance"),
  id: z.string(),
  name: z.string(),
  definitionId: z.string(),
  overrides: z.record(z.string(), z.any()).optional(),
  metadata: z.object({
    description: z.string().optional(),
    author: z.string().optional(),
    version: z.string().optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    deprecated: z.boolean().optional(),
    previewImage: z.string().url().optional(),
  }).optional(),
})

export type ComponentInstanceJSONType = z.infer<typeof ComponentInstanceJSONSchema>

// ============================================================================
// Node Union Schema
// ============================================================================

export const AnyNodeJSONSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    ComponentJSONSchema,
    ElementJSONSchema,
    BlockJSONSchema,
    SectionJSONSchema,
    TemplateJSONSchema,
    FlowJSONSchema,
    GroupJSONSchema,
    ComponentDefinitionJSONSchema,
    ComponentInstanceJSONSchema,
  ])
)

export type AnyNodeJSONType = z.infer<typeof AnyNodeJSONSchema>

// ============================================================================
// Export Schema (Complete structure for file export)
// ============================================================================

export const ExportSchemaV1 = z.object({
  version: z.string().default(SCHEMA_VERSION),
  format: z.literal(SCHEMA_FORMAT),
  type: z.enum(["component", "element", "block", "section", "template", "flow", "mixed"]),

  metadata: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
  }),

  // All nodes in flat structure (ID -> Node mapping)
  nodes: z.record(z.string(), AnyNodeJSONSchema),

  // Root node IDs (entry points)
  root: z.array(z.string()),

  // Groups (optional)
  groups: z.record(z.string(), GroupJSONSchema).optional(),

  // Component definitions (optional)
  components: z.record(z.string(), ComponentDefinitionJSONSchema).optional(),

  // Layout config (optional)
  layout: LayoutConfigSchema,

  // Routes (for templates/flows)
  routes: z.array(RouteConfigSchema).optional(),
})

export type ExportSchemaV1Type = z.infer<typeof ExportSchemaV1>

// ============================================================================
// Import Schema (More lenient for backward compatibility)
// ============================================================================

export const ImportSchemaV1 = ExportSchemaV1.extend({
  version: z.string(), // Don't enforce version match
  format: z.string(), // Accept any format string
}).passthrough() // Allow extra fields

export type ImportSchemaV1Type = z.infer<typeof ImportSchemaV1>

// ============================================================================
// CMS Legacy Schema (v0.4 compatibility)
// ============================================================================

export const CMSLegacyNodeSchema = z.object({
  type: z.string(),
  props: z.record(z.string(), z.any()),
  children: z.array(z.string()),
})

export const CMSLegacySchemaV04 = z.object({
  version: z.string(),
  root: z.array(z.string()),
  nodes: z.record(z.string(), CMSLegacyNodeSchema),
})

export type CMSLegacySchemaV04Type = z.infer<typeof CMSLegacySchemaV04>

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateExportSchema(data: unknown): ExportSchemaV1Type {
  return ExportSchemaV1.parse(data)
}

export function validateImportSchema(data: unknown): ImportSchemaV1Type {
  return ImportSchemaV1.parse(data)
}

export function validateComponentJSON(data: unknown): ComponentJSONType {
  return ComponentJSONSchema.parse(data)
}

export function validateElementJSON(data: unknown): ElementJSONType {
  return ElementJSONSchema.parse(data)
}

export function validateBlockJSON(data: unknown): BlockJSONType {
  return BlockJSONSchema.parse(data)
}

export function validateSectionJSON(data: unknown): SectionJSONType {
  return SectionJSONSchema.parse(data)
}

export function validateTemplateJSON(data: unknown): TemplateJSONType {
  return TemplateJSONSchema.parse(data)
}

export function validateFlowJSON(data: unknown): FlowJSONType {
  return FlowJSONSchema.parse(data)
}

export function validateCMSLegacySchema(data: unknown): CMSLegacySchemaV04Type {
  return CMSLegacySchemaV04.parse(data)
}

// ============================================================================
// Type Guards
// ============================================================================

export function isComponentJSON(data: any): data is ComponentJSONType {
  return data?.type === "component"
}

export function isElementJSON(data: any): data is ElementJSONType {
  return data?.type === "element"
}

export function isBlockJSON(data: any): data is BlockJSONType {
  return data?.type === "block"
}

export function isSectionJSON(data: any): data is SectionJSONType {
  return data?.type === "section"
}

export function isTemplateJSON(data: any): data is TemplateJSONType {
  return data?.type === "template"
}

export function isFlowJSON(data: any): data is FlowJSONType {
  return data?.type === "flow"
}

export function isGroupJSON(data: any): data is GroupJSONType {
  return data?.type === "group"
}

export function isComponentInstanceJSON(data: any): data is ComponentInstanceJSONType {
  return data?.type === "component-instance"
}

export function isComponentDefinitionJSON(data: any): data is ComponentDefinitionJSONType {
  return data?.type === "component-definition"
}

// ============================================================================
// Schema Migration Helpers
// ============================================================================

export interface SchemaMigration {
  from: string
  to: string
  migrate: (data: any) => any
}

export const migrations: SchemaMigration[] = [
  {
    from: "0.4",
    to: "1.0.0",
    migrate: (data: CMSLegacySchemaV04Type): ExportSchemaV1Type => {
      // Convert CMS v0.4 schema to v1.0.0
      return {
        version: "1.0.0",
        format: "superspace-v1",
        type: "mixed",
        metadata: {
          id: `migrated-${Date.now()}`,
          name: "Migrated from CMS v0.4",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        nodes: Object.entries(data.nodes).reduce((acc, [id, node]) => {
          acc[id] = {
            type: "component",
            component: node.type,
            props: node.props,
            children: node.children,
          }
          return acc
        }, {} as Record<string, any>),
        root: data.root,
        layout: {},
      }
    },
  },
]

export function migrateSchema(data: any): ExportSchemaV1Type {
  const version = data.version || "0.4"

  let migrated = data
  for (const migration of migrations) {
    if (version === migration.from) {
      migrated = migration.migrate(migrated)
    }
  }

  return validateExportSchema(migrated)
}
