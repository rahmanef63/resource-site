/**
 * TOON Parser
 * 
 * Parses TOON documents back to native JavaScript objects.
 */

import type {
    ToonDocument,
    ToonValue,
    ToonParseOptions,
    ToonValidationResult,
} from "./types";
import { isToonDocument, isToonReference } from "./types";

// ============================================================================
// Main Parser Functions
// ============================================================================

/**
 * Parse TOON document to array of objects
 */
export function parseToon<T extends Record<string, any>>(
    toon: ToonDocument,
    options: ToonParseOptions = {}
): T[] {
    if (!isToonDocument(toon)) {
        throw new Error("Invalid TOON document");
    }

    const { validate = false, skipInvalid = false } = options;
    const { $k: keys, $d: data } = toon;

    const results: T[] = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
            const record = parseRow<T>(keys, row);

            if (validate && toon.$s) {
                const validation = validateRow(record, toon.$s.fields, i);
                if (!validation.valid) {
                    if (skipInvalid) continue;
                    throw new Error(validation.errors[0]?.message || "Validation failed");
                }
            }

            results.push(record);
        } catch (error) {
            if (!skipInvalid) throw error;
        }
    }

    return results;
}

/**
 * Parse single row from TOON format
 */
export function parseRow<T extends Record<string, any>>(
    keys: string[],
    values: ToonValue[]
): T {
    const record = {} as T;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[i];
        (record as any)[key] = parseValue(value);
    }

    return record;
}

/**
 * Parse individual TOON value
 */
export function parseValue(value: ToonValue): any {
    // Handle null
    if (value === null) return null;

    // Handle reference
    if (isToonReference(value)) {
        return value.$r; // Return reference ID
    }

    // Handle array (recursive)
    if (Array.isArray(value)) {
        return value.map(parseValue);
    }

    // Handle primitives
    return value;
}

// ============================================================================
// Validation
// ============================================================================

interface SchemaField {
    k: string;
    t: string;
    r?: boolean;
}

function validateRow(
    record: Record<string, any>,
    fields: SchemaField[],
    rowIndex: number
): ToonValidationResult {
    const errors: ToonValidationResult["errors"] = [];
    const warnings: string[] = [];

    for (const field of fields) {
        const value = record[field.k];

        // Check required
        if (field.r && (value === null || value === undefined)) {
            errors.push({
                row: rowIndex,
                field: field.k,
                message: `Required field "${field.k}" is missing`,
                code: "missing_required",
            });
            continue;
        }

        // Skip type check for null/undefined
        if (value === null || value === undefined) continue;

        // Type validation
        const actualType = getValueType(value);
        if (!isTypeCompatible(actualType, field.t)) {
            errors.push({
                row: rowIndex,
                field: field.k,
                message: `Field "${field.k}" expected type "${field.t}", got "${actualType}"`,
                code: "type_mismatch",
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

function getValueType(value: any): string {
    if (value === null) return "null";
    if (Array.isArray(value)) return "a";
    if (typeof value === "string") return "s";
    if (typeof value === "number") return "n";
    if (typeof value === "boolean") return "b";
    if (value instanceof Date) return "d";
    if (typeof value === "object") return "o";
    return "s";
}

function isTypeCompatible(actual: string, expected: string): boolean {
    if (actual === expected) return true;
    // Allow string for date (ISO format)
    if (expected === "d" && actual === "s") return true;
    return false;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get metadata from TOON document
 */
export function getToonMeta(toon: ToonDocument): {
    type: string;
    count: number;
    keys: string[];
    createdAt?: Date;
    updatedAt?: Date;
} {
    return {
        type: toon.$t,
        count: toon.$d.length,
        keys: toon.$k,
        createdAt: toon.$m?.c ? new Date(toon.$m.c * 1000) : undefined,
        updatedAt: toon.$m?.u ? new Date(toon.$m.u * 1000) : undefined,
    };
}

/**
 * Get record by index
 */
export function getToonRecord<T extends Record<string, any>>(
    toon: ToonDocument,
    index: number
): T | null {
    if (index < 0 || index >= toon.$d.length) return null;
    return parseRow<T>(toon.$k, toon.$d[index]);
}

/**
 * Find records by field value
 */
export function findToonRecords<T extends Record<string, any>>(
    toon: ToonDocument,
    field: string,
    value: any
): T[] {
    const keyIndex = toon.$k.indexOf(field);
    if (keyIndex === -1) return [];

    const results: T[] = [];
    for (let i = 0; i < toon.$d.length; i++) {
        if (toon.$d[i][keyIndex] === value) {
            results.push(parseRow<T>(toon.$k, toon.$d[i]));
        }
    }
    return results;
}

export default { parseToon, parseRow, parseValue, getToonMeta };
