/**
 * TOON Format Types
 * 
 * Token-Optimized Object Notation - A compact data format
 * designed for efficient storage and transmission.
 */

// ============================================================================
// Core TOON Types
// ============================================================================

/**
 * TOON value types (compact)
 */
export type ToonValue =
    | string
    | number
    | boolean
    | null
    | ToonValue[]                      // Nested arrays
    | { $r: string };                  // Reference to another entity

/**
 * Type shorthand for schema
 * s = string, n = number, b = boolean, d = date
 * a = array, o = object, r = reference
 */
export type ToonFieldType = "s" | "n" | "b" | "d" | "a" | "o" | "r";

/**
 * Field definition in schema
 */
export interface ToonSchemaField {
    /** Field key */
    k: string;
    /** Field type shorthand */
    t: ToonFieldType;
    /** Required field? */
    r?: boolean;
    /** Default value */
    d?: ToonValue;
    /** Description (for docs) */
    desc?: string;
}

/**
 * TOON Schema for validation
 */
export interface ToonSchema {
    fields: ToonSchemaField[];
}

/**
 * TOON Metadata
 */
export interface ToonMeta {
    /** Created timestamp (Unix) */
    c: number;
    /** Updated timestamp (Unix) */
    u: number;
    /** Record count */
    n: number;
    /** Hash for integrity */
    h?: string;
    /** Source info */
    src?: string;
}

/**
 * Main TOON Document structure
 */
export interface ToonDocument<T = any> {
    /** Version */
    $v: 1;
    /** Type identifier (e.g., "contacts", "tasks") */
    $t: string;
    /** Schema definition (optional) */
    $s?: ToonSchema;
    /** Metadata */
    $m?: ToonMeta;
    /** Keys (column names) - single array */
    $k: string[];
    /** Data rows (values only) - 2D array */
    $d: ToonValue[][];
    /** Indices for fast lookup (optional) */
    $i?: Record<string, number[]>;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Options for parsing TOON
 */
export interface ToonParseOptions {
    /** Validate against schema */
    validate?: boolean;
    /** Skip invalid rows */
    skipInvalid?: boolean;
}

/**
 * Options for serializing to TOON
 */
export interface ToonSerializeOptions {
    /** Include schema in output */
    includeSchema?: boolean;
    /** Include metadata */
    includeMetadata?: boolean;
    /** Custom type identifier */
    type?: string;
}

/**
 * Validation result
 */
export interface ToonValidationResult {
    valid: boolean;
    errors: ToonValidationError[];
    warnings: string[];
}

/**
 * Validation error
 */
export interface ToonValidationError {
    row?: number;
    field?: string;
    message: string;
    code: "missing_required" | "type_mismatch" | "invalid_value" | "schema_error";
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if value is a TOON document
 */
export function isToonDocument(value: unknown): value is ToonDocument {
    if (!value || typeof value !== "object") return false;
    const doc = value as ToonDocument;
    return (
        doc.$v === 1 &&
        typeof doc.$t === "string" &&
        Array.isArray(doc.$k) &&
        Array.isArray(doc.$d)
    );
}

/**
 * Check if value is a TOON reference
 */
export function isToonReference(value: unknown): value is { $r: string } {
    return (
        value !== null &&
        typeof value === "object" &&
        "$r" in value &&
        typeof (value as { $r: unknown }).$r === "string"
    );
}

// ============================================================================
// Type Mapping Utilities
// ============================================================================

/**
 * Map full type name to TOON shorthand
 */
export function toToonType(type: string): ToonFieldType {
    const map: Record<string, ToonFieldType> = {
        string: "s",
        number: "n",
        boolean: "b",
        date: "d",
        array: "a",
        object: "o",
        reference: "r",
    };
    return map[type.toLowerCase()] || "s";
}

/**
 * Map TOON shorthand to full type name
 */
export function fromToonType(type: ToonFieldType): string {
    const map: Record<ToonFieldType, string> = {
        s: "string",
        n: "number",
        b: "boolean",
        d: "date",
        a: "array",
        o: "object",
        r: "reference",
    };
    return map[type];
}
