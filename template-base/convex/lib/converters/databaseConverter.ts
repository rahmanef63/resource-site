/**
 * Database Converter
 *
 * Converts between V1 database format and Universal Database v2.0 format.
 * Provides type-safe, bidirectional conversion with graceful handling of missing fields.
 *
 * @see docs/UNIVERSAL_DATABASE_SPEC.md
 */

import { Id } from "../../_generated/dataModel";

// ==========================================
// Type Definitions
// ==========================================

/**
 * V1 Database Table (from Convex schema)
 */
export interface V1DbTable {
  _id: Id<"dbTables">;
  workspaceId: Id<"workspaces">;
  name: string;
  description?: string;
  icon?: string;
  coverUrl?: string;
  isPublic?: boolean;
  createdById: Id<"users">;
  updatedById: Id<"users">;
  isTemplate: boolean;
  settings: {
    showProperties: boolean;
    wrapCells: boolean;
    showCalculations: boolean;
  };
  createdAt?: number;
  updatedAt?: number;
}

/**
 * V1 Database Field
 */
export interface V1DbField {
  _id: Id<"dbFields">;
  tableId: Id<"dbTables">;
  name: string;
  type: string;
  options?: {
    selectOptions?: Array<{
      id: string;
      name: string;
      color: string;
    }>;
    dateFormat?: string;
    numberFormat?: string;
    formula?: string;
  };
  isRequired: boolean;
  isPrimary?: boolean;
  position: number;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * V1 Database View
 */
export interface V1DbView {
  _id: Id<"dbViews">;
  tableId: Id<"dbTables">;
  name: string;
  type: string;
  settings: {
    filters: Array<{
      fieldId: string;
      operator: string;
      value?: any;
    }>;
    sorts: Array<{
      fieldId: string;
      direction: "asc" | "desc";
    }>;
    visibleFields: Array<Id<"dbFields">>;
    fieldWidths?: Record<string, number>;
  };
  createdById: Id<"users">;
  isDefault: boolean;
  position?: number;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * V1 Database Row
 */
export interface V1DbRow {
  _id: Id<"dbRows">;
  tableId: Id<"dbTables">;
  workspaceId: Id<"workspaces">;
  data: Record<string, any>;
  computed?: Record<string, any>;
  docId?: Id<"documents">;
  createdById: Id<"users">;
  updatedById: Id<"users">;
  position: number;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Universal Database v2.0 types (simplified for converter)
 */
export interface UniversalDatabase {
  schemaVersion: "2.0";
  db: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    coverUrl?: string;
    workspaceId?: string;
    properties: Array<{
      key: string;
      name: string;
      type: string;
      options?: any;
      description?: string;
      isRequired?: boolean;
      isPrimary?: boolean;
      position?: number;
    }>;
    views: Array<{
      id?: string;
      name: string;
      layout: string;
      description?: string;
      visibleProps?: string[];
      filters?: Array<{
        property: string;
        operator: string;
        value?: any;
      }>;
      sorts?: Array<{
        property: string;
        direction: "ascending" | "descending";
      }>;
      groupBy?: string;
      options?: any;
      isDefault?: boolean;
      position?: number;
      createdBy?: string;
      createdTime?: number;
    }>;
    rows: Array<{
      id: string;
      properties: Record<string, any>;
      position?: number;
      createdBy?: string;
      createdTime?: number;
      lastEditedBy?: string;
      lastEditedTime?: number;
    }>;
    createdBy?: string;
    createdTime?: number;
    lastEditedBy?: string;
    lastEditedTime?: number;
    settings?: {
      showProperties?: boolean;
      wrapCells?: boolean;
      showCalculations?: boolean;
      isPublic?: boolean;
      isTemplate?: boolean;
    };
  };
}

// ==========================================
// Type Mapping Tables
// ==========================================

/**
 * Maps V1 field types to Universal property types
 */
const V1_TO_UNIVERSAL_TYPE_MAP: Record<string, string> = {
  text: "title",
  number: "number",
  select: "select",
  multiSelect: "multi_select",
  date: "date",
  person: "people",
  files: "files",
  checkbox: "checkbox",
  url: "url",
  email: "email",
  phone: "phone",
  formula: "formula",
  relation: "relation",
  rollup: "rollup",
};

/**
 * Maps Universal property types to V1 field types
 */
const UNIVERSAL_TO_V1_TYPE_MAP: Record<string, string> = {
  title: "text",
  rich_text: "text",
  number: "number",
  select: "select",
  multi_select: "multiSelect",
  date: "date",
  people: "person",
  files: "files",
  checkbox: "checkbox",
  url: "url",
  email: "email",
  phone: "phone",
  formula: "formula",
  relation: "relation",
  rollup: "rollup",
  // Extended types (fallback to text for unsupported)
  status: "select",
  button: "text",
  unique_id: "text",
  place: "text",
  created_time: "date",
  created_by: "person",
  last_edited_time: "date",
  last_edited_by: "person",
};

/**
 * Maps V1 view types to Universal layouts
 */
const V1_TO_UNIVERSAL_LAYOUT_MAP: Record<string, string> = {
  table: "table",
  board: "board",
  calendar: "calendar",
  gallery: "gallery",
  list: "list",
  timeline: "timeline",
};

/**
 * Maps Universal layouts to V1 view types
 */
const UNIVERSAL_TO_V1_LAYOUT_MAP: Record<string, string> = {
  table: "table",
  board: "board",
  list: "list",
  timeline: "timeline",
  calendar: "calendar",
  gallery: "gallery",
  // New layouts (fallback to table)
  map: "table",
  chart: "table",
  feed: "list",
  form: "table",
};

/**
 * Maps V1 filter operators to Universal operators
 */
const V1_TO_UNIVERSAL_OPERATOR_MAP: Record<string, string> = {
  equals: "equals",
  contains: "contains",
  isEmpty: "is_empty",
  isNotEmpty: "is_not_empty",
};

/**
 * Maps Universal operators to V1 filter operators
 */
const UNIVERSAL_TO_V1_OPERATOR_MAP: Record<string, string> = {
  equals: "equals",
  not_equals: "equals", // Fallback
  contains: "contains",
  not_contains: "contains", // Fallback
  is_empty: "isEmpty",
  is_not_empty: "isNotEmpty",
  starts_with: "contains",
  ends_with: "contains",
  greater_than: "equals",
  less_than: "equals",
  greater_than_or_equal: "equals",
  less_than_or_equal: "equals",
  before: "equals",
  after: "equals",
  on_or_before: "equals",
  on_or_after: "equals",
  is_checked: "equals",
  is_not_checked: "equals",
};

// ==========================================
// Conversion Functions
// ==========================================

/**
 * Convert V1 database to Universal Database v2.0
 *
 * @param table - V1 database table
 * @param fields - V1 database fields
 * @param views - V1 database views
 * @param rows - V1 database rows (optional)
 * @returns Universal Database v2.0 format
 */
export function toUniversal(
  table: V1DbTable,
  fields: V1DbField[],
  views: V1DbView[],
  rows: V1DbRow[] = []
): UniversalDatabase {
  // Create field ID to key mapping
  const fieldIdToKey = new Map<string, string>();
  fields.forEach((field, index) => {
    const key = field.name.toLowerCase().replace(/\s+/g, "_");
    fieldIdToKey.set(field._id, key);
  });

  // Convert properties
  const properties = fields.map((field) => {
    const key = fieldIdToKey.get(field._id) || field._id;
    const universalType = V1_TO_UNIVERSAL_TYPE_MAP[field.type] || "rich_text";

    return {
      key,
      name: field.name,
      type: universalType,
      options: field.options,
      isRequired: field.isRequired,
      isPrimary: field.isPrimary,
      position: field.position,
    };
  });

  // Convert views
  const convertedViews = views.map((view) => {
    const layout = V1_TO_UNIVERSAL_LAYOUT_MAP[view.type] || "table";

    // Convert visible fields from IDs to keys
    const visibleProps = view.settings.visibleFields
      .map((fieldId) => fieldIdToKey.get(fieldId))
      .filter((key): key is string => key !== undefined);

    // Convert filters
    const filters = view.settings.filters.map((filter) => ({
      property: fieldIdToKey.get(filter.fieldId) || filter.fieldId,
      operator: V1_TO_UNIVERSAL_OPERATOR_MAP[filter.operator] || "equals",
      value: filter.value,
    }));

    // Convert sorts
    const sorts = view.settings.sorts.map((sort) => ({
      property: fieldIdToKey.get(sort.fieldId) || sort.fieldId,
      direction: sort.direction === "asc" ? ("ascending" as const) : ("descending" as const),
    }));

    return {
      id: view._id,
      name: view.name,
      layout,
      visibleProps,
      filters,
      sorts,
      isDefault: view.isDefault,
      position: view.position,
      createdBy: view.createdById,
      createdTime: view.createdAt,
    };
  });

  // Convert rows
  const convertedRows = rows.map((row) => {
    // Convert data keys from field IDs to property keys
    const properties: Record<string, any> = {};
    for (const [fieldId, value] of Object.entries(row.data)) {
      const key = fieldIdToKey.get(fieldId) || fieldId;
      properties[key] = value;
    }

    return {
      id: row._id,
      properties,
      position: row.position,
      createdBy: row.createdById,
      createdTime: row.createdAt,
      lastEditedBy: row.updatedById,
      lastEditedTime: row.updatedAt,
    };
  });

  return {
    schemaVersion: "2.0",
    db: {
      id: table._id,
      name: table.name,
      description: table.description,
      icon: table.icon,
      coverUrl: table.coverUrl,
      workspaceId: table.workspaceId,
      properties,
      views: convertedViews,
      rows: convertedRows,
      createdBy: table.createdById,
      createdTime: table.createdAt,
      lastEditedBy: table.updatedById,
      lastEditedTime: table.updatedAt,
      settings: {
        showProperties: table.settings.showProperties,
        wrapCells: table.settings.wrapCells,
        showCalculations: table.settings.showCalculations,
        isPublic: table.isPublic,
        isTemplate: table.isTemplate,
      },
    },
  };
}

/**
 * Convert Universal Database v2.0 to V1 format
 *
 * @param universal - Universal Database v2.0
 * @param workspaceId - Target workspace ID
 * @param userId - Current user ID
 * @returns V1 database components (table, fields, views, rows)
 */
export function fromUniversal(
  universal: UniversalDatabase,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
): {
  table: Omit<V1DbTable, "_id">;
  fields: Array<Omit<V1DbField, "_id" | "tableId">>;
  views: Array<Omit<V1DbView, "_id" | "tableId">>;
  rows: Array<Omit<V1DbRow, "_id" | "tableId" | "workspaceId">>;
} {
  const { db } = universal;
  const now = Date.now();

  // Create property key to temporary field ID mapping
  const keyToFieldId = new Map<string, string>();
  db.properties.forEach((prop, index) => {
    // Use a temporary ID that will be replaced when inserted into Convex
    const tempId = `field_${index}`;
    keyToFieldId.set(prop.key, tempId);
  });

  // Convert table
  const table: Omit<V1DbTable, "_id"> = {
    workspaceId,
    name: db.name,
    description: db.description,
    icon: db.icon,
    coverUrl: db.coverUrl,
    isPublic: db.settings?.isPublic ?? false,
    createdById: userId,
    updatedById: userId,
    isTemplate: db.settings?.isTemplate ?? false,
    settings: {
      showProperties: db.settings?.showProperties ?? true,
      wrapCells: db.settings?.wrapCells ?? false,
      showCalculations: db.settings?.showCalculations ?? true,
    },
    createdAt: db.createdTime ?? now,
    updatedAt: db.lastEditedTime ?? now,
  };

  // Convert fields
  const fields = db.properties.map((prop) => {
    const v1Type = UNIVERSAL_TO_V1_TYPE_MAP[prop.type] || "text";

    return {
      name: prop.name,
      type: v1Type,
      options: prop.options,
      isRequired: prop.isRequired ?? false,
      isPrimary: prop.isPrimary,
      position: prop.position ?? 0,
      createdAt: now,
      updatedAt: now,
    };
  });

  // Convert views
  const views = db.views.map((view) => {
    const v1Type = UNIVERSAL_TO_V1_LAYOUT_MAP[view.layout] || "table";

    // Convert visible props from keys to field IDs
    const visibleFields = (view.visibleProps || [])
      .map((key) => keyToFieldId.get(key))
      .filter((id): id is string => id !== undefined) as Array<Id<"dbFields">>;

    // Convert filters
    const filters = (view.filters || []).map((filter) => ({
      fieldId: keyToFieldId.get(filter.property) || filter.property,
      operator: UNIVERSAL_TO_V1_OPERATOR_MAP[filter.operator] || "equals",
      value: filter.value,
    }));

    // Convert sorts
    const sorts = (view.sorts || []).map((sort) => ({
      fieldId: keyToFieldId.get(sort.property) || sort.property,
      direction: sort.direction === "ascending" ? ("asc" as const) : ("desc" as const),
    }));

    return {
      name: view.name,
      type: v1Type,
      settings: {
        filters,
        sorts,
        visibleFields,
        fieldWidths: {},
      },
      createdById: userId,
      isDefault: view.isDefault ?? false,
      position: view.position,
      createdAt: view.createdTime ?? now,
      updatedAt: now,
    };
  });

  // Convert rows
  const rows = db.rows.map((row) => {
    // Convert property keys to field IDs
    const data: Record<string, any> = {};
    for (const [key, value] of Object.entries(row.properties)) {
      const fieldId = keyToFieldId.get(key) || key;
      data[fieldId] = value;
    }

    return {
      data,
      computed: {},
      createdById: userId,
      updatedById: userId,
      position: row.position ?? 0,
      createdAt: row.createdTime ?? now,
      updatedAt: row.lastEditedTime ?? now,
    };
  });

  return {
    table,
    fields,
    views,
    rows,
  };
}

/**
 * Validate that a Universal Database is well-formed
 *
 * @param universal - Universal Database to validate
 * @returns Validation result
 */
export function validateUniversalDatabase(universal: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!universal || typeof universal !== "object") {
    return { valid: false, errors: ["Invalid database format"] };
  }

  const db = universal as any;

  // Check schema version
  if (db.schemaVersion !== "2.0") {
    errors.push("Invalid schema version. Expected 2.0");
  }

  // Check required fields
  if (!db.db) {
    errors.push("Missing db field");
  } else {
    if (!db.db.id) errors.push("Missing db.id");
    if (!db.db.name) errors.push("Missing db.name");
    if (!Array.isArray(db.db.properties)) errors.push("Missing or invalid db.properties");
    if (!Array.isArray(db.db.views)) errors.push("Missing or invalid db.views");
    if (!Array.isArray(db.db.rows)) errors.push("Missing or invalid db.rows");

    // Check that at least one property is primary
    if (Array.isArray(db.db.properties)) {
      const primaryProps = db.db.properties.filter((p: any) => p.isPrimary);
      if (primaryProps.length === 0) {
        errors.push("Database must have at least one primary property");
      }
      if (primaryProps.length > 1) {
        errors.push("Database can only have one primary property");
      }
    }

    // Check that at least one view is default
    if (Array.isArray(db.db.views)) {
      const defaultViews = db.db.views.filter((v: any) => v.isDefault);
      if (defaultViews.length === 0) {
        errors.push("Database must have at least one default view");
      }
      if (defaultViews.length > 1) {
        errors.push("Database can only have one default view");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a minimal valid Universal Database
 *
 * @param name - Database name
 * @param workspaceId - Workspace ID
 * @param userId - Creator user ID
 * @returns Minimal Universal Database
 */
export function createMinimalDatabase(
  name: string,
  workspaceId: string,
  userId: string
): UniversalDatabase {
  const now = Date.now();

  return {
    schemaVersion: "2.0",
    db: {
      id: `db_${now}`,
      name,
      workspaceId,
      properties: [
        {
          key: "name",
          name: "Name",
          type: "title",
          isRequired: true,
          isPrimary: true,
          position: 0,
        },
      ],
      views: [
        {
          name: "All Items",
          layout: "table",
          isDefault: true,
          visibleProps: ["name"],
          filters: [],
          sorts: [],
          position: 0,
        },
      ],
      rows: [],
      createdBy: userId,
      createdTime: now,
      lastEditedBy: userId,
      lastEditedTime: now,
      settings: {
        showProperties: true,
        wrapCells: false,
        showCalculations: true,
        isPublic: false,
        isTemplate: false,
      },
    },
  };
}
