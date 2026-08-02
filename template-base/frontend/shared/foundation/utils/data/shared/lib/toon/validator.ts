/**
 * TOON Validator
 * 
 * Validates TOON documents against schema definitions.
 */

import type {
    ToonDocument,
    ToonSchema,
    ToonSchemaField,
    ToonValue,
    ToonValidationResult,
    ToonValidationError,
    ToonFieldType,
} from "./types";
import { isToonDocument, isToonReference, fromToonType } from "./types";

// ============================================================================
// Main Validation Functions
// ============================================================================

/**
 * Validate TOON document structure and optionally schema
 */
export function validateToon(
    doc: unknown,
    schema?: ToonSchema
): ToonValidationResult {
    const errors: ToonValidationError[] = [];
    const warnings: string[] = [];

    // Check basic structure
    if (!isToonDocument(doc)) {
        errors.push({
            message: "Invalid TOON document structure",
            code: "schema_error",
        });
        return { valid: false, errors, warnings };
    }

    // Validate version
    if (doc.$v !== 1) {
        warnings.push(`Unknown TOON version: ${doc.$v}`);
    }

    // Validate keys match data columns
    const keyCount = doc.$k.length;
    for (let i = 0; i < doc.$d.length; i++) {
        if (doc.$d[i].length !== keyCount) {
            errors.push({
                row: i,
                message: `Row ${i} has ${doc.$d[i].length} values, expected ${keyCount}`,
                code: "schema_error",
            });
        }
    }

    // If schema provided, validate data against it
    if (schema) {
        const schemaErrors = validateAgainstSchema(doc, schema);
        errors.push(...schemaErrors);
    } else if (doc.$s) {
        // Use embedded schema
        const schemaErrors = validateAgainstSchema(doc, doc.$s);
        errors.push(...schemaErrors);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate document data against schema
 */
export function validateAgainstSchema(
    doc: ToonDocument,
    schema: ToonSchema
): ToonValidationError[] {
    const errors: ToonValidationError[] = [];
    const { $k: keys, $d: data } = doc;

    // Build key index map
    const keyIndexMap = new Map(keys.map((k, i) => [k, i]));

    // Check each schema field
    for (const field of schema.fields) {
        const keyIndex = keyIndexMap.get(field.k);

        // Check if required field exists in keys
        if (keyIndex === undefined) {
            if (field.r) {
                errors.push({
                    field: field.k,
                    message: `Required field "${field.k}" not found in document keys`,
                    code: "missing_required",
                });
            }
            continue;
        }

        // Validate each row for this field
        for (let i = 0; i < data.length; i++) {
            const value = data[i][keyIndex];
            const fieldErrors = validateFieldValue(value, field, i);
            errors.push(...fieldErrors);
        }
    }

    return errors;
}

/**
 * Validate single field value
 */
export function validateFieldValue(
    value: ToonValue,
    field: ToonSchemaField,
    rowIndex: number
): ToonValidationError[] {
    const errors: ToonValidationError[] = [];

    // Check required
    if (field.r && (value === null || value === undefined)) {
        errors.push({
            row: rowIndex,
            field: field.k,
            message: `Required field "${field.k}" is null/undefined`,
            code: "missing_required",
        });
        return errors;
    }

    // Skip type check for null
    if (value === null || value === undefined) return errors;

    // Type validation
    if (!isValueTypeValid(value, field.t)) {
        errors.push({
            row: rowIndex,
            field: field.k,
            message: `Field "${field.k}" expected type "${fromToonType(field.t)}", got "${typeof value}"`,
            code: "type_mismatch",
        });
    }

    return errors;
}

/**
 * Check if value matches expected TOON type
 */
export function isValueTypeValid(value: ToonValue, expectedType: ToonFieldType): boolean {
    if (value === null) return true; // Null is valid for any type (unless required)

    switch (expectedType) {
        case "s": // string
            return typeof value === "string";
        case "n": // number
            return typeof value === "number";
        case "b": // boolean
            return typeof value === "boolean";
        case "d": // date (stored as string)
            return typeof value === "string" && !isNaN(Date.parse(value));
        case "a": // array
            return Array.isArray(value);
        case "o": // object
            return typeof value === "object" && !Array.isArray(value);
        case "r": // reference
            return isToonReference(value);
        default:
            return true;
    }
}

// ============================================================================
// Schema Utilities
// ============================================================================

/**
 * Create schema from keys with default types
 */
export function createSchema(
    keys: string[],
    requiredFields?: string[]
): ToonSchema {
    return {
        fields: keys.map((k) => ({
            k,
            t: "s" as ToonFieldType, // Default to string
            r: requiredFields?.includes(k),
        })),
    };
}

/**
 * Merge two schemas (second overrides first)
 */
export function mergeSchemas(
    base: ToonSchema,
    override: Partial<ToonSchema>
): ToonSchema {
    if (!override.fields) return base;

    const fieldMap = new Map(base.fields.map((f) => [f.k, f]));

    for (const field of override.fields) {
        fieldMap.set(field.k, { ...fieldMap.get(field.k), ...field });
    }

    return {
        fields: Array.from(fieldMap.values()),
    };
}

/**
 * Get required fields from schema
 */
export function getRequiredFields(schema: ToonSchema): string[] {
    return schema.fields.filter((f) => f.r).map((f) => f.k);
}

/**
 * Check if schema has field
 */
export function hasSchemaField(schema: ToonSchema, key: string): boolean {
    return schema.fields.some((f) => f.k === key);
}

export default {
    validateToon,
    validateAgainstSchema,
    validateFieldValue,
    isValueTypeValid,
    createSchema,
    mergeSchemas,
    getRequiredFields,
};
